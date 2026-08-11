import type { Writable } from "node:stream";

import type { FastifyRequest, FastifyServerOptions } from "fastify";

import type { RuntimeLogLevel } from "../config/runtime-config.js";

const REDACTED = "[REDACTED]";

const REDACTION_PATHS = [
  "authorization",
  "cookie",
  "set-cookie",
  "proxy-authorization",
  "x-api-key",
  "password",
  "secret",
  "token",
  "apiKey",
  "api_key",
  "serviceRoleKey",
  "service_role_key",
  "headers.authorization",
  "headers.cookie",
  "headers.set-cookie",
  "headers.proxy-authorization",
  "headers.x-api-key",
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers.proxy-authorization",
  "req.headers.x-api-key",
  "request.headers.authorization",
  "request.headers.cookie",
  "request.headers.proxy-authorization",
  "request.headers.x-api-key",
  "res.headers.set-cookie",
  "response.headers.set-cookie",
  "*.password",
  "*.secret",
  "*.token",
] as const;

export interface TransportLoggerOptions {
  readonly level: RuntimeLogLevel;
  readonly stream?: Writable;
}

export function createTransportLogger(
  options: TransportLoggerOptions,
): Exclude<FastifyServerOptions["logger"], boolean | undefined> {
  const logger = {
    level: options.level,
    base: { service: "platform-api" },
    redact: {
      paths: [...REDACTION_PATHS],
      censor: REDACTED,
    },
    serializers: {
      err() {
        return { type: "Error", message: REDACTED, stack: REDACTED };
      },
      req(request: FastifyRequest) {
        return { id: request.id, method: request.method };
      },
      res(response: { statusCode: string | number }) {
        return { statusCode: response.statusCode };
      },
    },
    ...(options.stream === undefined ? {} : { stream: options.stream }),
  };

  return logger;
}
