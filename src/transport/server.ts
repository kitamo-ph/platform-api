import type { Writable } from "node:stream";

import Fastify, { LogController, type FastifyInstance } from "fastify";

import type { RuntimeLogLevel } from "../config/runtime-config.js";
import { createTransportErrorPayload, installTransportErrorHandling } from "./error-handler.js";
import { createTransportLogger } from "./logging.js";
import { generateInternalRequestId } from "./request-id.js";

export const TRANSPORT_BODY_LIMIT_BYTES = 65_536;

export interface CreateServerOptions {
  readonly logLevel?: RuntimeLogLevel;
  readonly loggerStream?: Writable;
}

export interface PlatformServer extends FastifyInstance {
  readonly beginTransportDrain: () => void;
}

function assertPlatformServer(server: FastifyInstance): asserts server is PlatformServer {
  if (typeof Reflect.get(server, "beginTransportDrain") !== "function") {
    throw new Error("Transport lifecycle decoration is unavailable.");
  }
}

export function createServer(options: CreateServerOptions = {}): PlatformServer {
  const loggerOptions = createTransportLogger({
    level: options.logLevel ?? "info",
    ...(options.loggerStream === undefined ? {} : { stream: options.loggerStream }),
  });
  const server = Fastify({
    logger: loggerOptions,
    logController: new LogController({
      disableRequestLogging: true,
      requestIdLogLabel: "request_id",
    }),
    bodyLimit: TRANSPORT_BODY_LIMIT_BYTES,
    trustProxy: false,
    requestIdHeader: false,
    genReqId: generateInternalRequestId,
    return503OnClosing: false,
    allowErrorHandlerOverride: false,
    onProtoPoisoning: "error",
    onConstructorPoisoning: "error",
  });

  let isDraining = false;
  server.decorate("beginTransportDrain", () => {
    isDraining = true;
  });
  assertPlatformServer(server);

  server.removeContentTypeParser("text/plain");

  server.addHook("onRequest", (request, reply, done) => {
    reply.header("x-request-id", request.id);
    if (isDraining) {
      const payload = createTransportErrorPayload(
        request,
        "SERVICE_UNAVAILABLE",
        "Service temporarily unavailable.",
        true,
      );
      request.log.warn(
        { event: "request.rejected", status_code: 503 },
        "Request rejected during shutdown",
      );
      reply.code(503).type("application/json; charset=utf-8").send(payload);
      return;
    }
    request.log.info(
      { event: "request.received", request_id: request.id, method: request.method },
      "Request received",
    );
    done();
  });

  server.addHook("onResponse", (request, reply, done) => {
    request.log.info(
      {
        event: "request.completed",
        request_id: request.id,
        method: request.method,
        status_code: reply.statusCode,
        elapsed_ms: Math.round(reply.elapsedTime),
      },
      "Request completed",
    );
    done();
  });

  server.addHook("onSend", (_request, reply, _payload, done) => {
    reply.removeHeader("server");
    reply.removeHeader("x-powered-by");
    done();
  });

  server.addHook("onClose", (instance, done) => {
    instance.log.info({ event: "runtime.server_closed" }, "Server lifecycle closed");
    done();
  });

  installTransportErrorHandling(server);
  return server;
}
