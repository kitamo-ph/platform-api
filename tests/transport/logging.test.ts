import type { FastifyInstance } from "fastify";
import { Writable } from "node:stream";
import { afterEach, describe, expect, it } from "vitest";

import { StructuredErrorSchema } from "../../src/contracts/index.js";
import { createServer } from "../../src/transport/server.js";

const REDACTED = "[REDACTED]";
const servers = new Set<FastifyInstance>();

interface LogCapture {
  readonly stream: Writable;
  readonly text: () => string;
  readonly records: () => readonly Record<string, unknown>[];
}

function createLogCapture(): LogCapture {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(String(chunk));
      callback();
    },
  });

  const text = () => chunks.join("");
  return {
    stream,
    text,
    records() {
      return text()
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line) as Record<string, unknown>);
    },
  };
}

function track(server: FastifyInstance): FastifyInstance {
  servers.add(server);
  return server;
}

afterEach(async () => {
  await Promise.all(
    [...servers].map(async (server) => {
      await server.close().catch(() => undefined);
    }),
  );
  servers.clear();
});

describe("structured operational logging", () => {
  it("redacts sensitive headers and top-level or nested secret fields", async () => {
    const capture = createLogCapture();
    const server = track(createServer({ logLevel: "info", loggerStream: capture.stream }));
    const secrets = {
      authorization: "synthetic-authorization-value",
      cookie: "synthetic-cookie-value",
      proxyAuthorization: "synthetic-proxy-authorization-value",
      apiKeyHeader: "synthetic-api-key-header-value",
      password: "synthetic-password-value",
      secret: "synthetic-secret-field-value",
      token: "synthetic-token-field-value",
      apiKey: "synthetic-camel-api-key-value",
      apiKeySnake: "synthetic-snake-api-key-value",
      serviceRoleKey: "synthetic-camel-service-role-value",
      serviceRoleKeySnake: "synthetic-snake-service-role-value",
      nestedPassword: "synthetic-nested-password-value",
      nestedSecret: "synthetic-nested-secret-value",
      nestedToken: "synthetic-nested-token-value",
    } as const;

    server.post("/__test__/redaction", (request) => {
      request.log.info(
        {
          authorization: secrets.authorization,
          cookie: secrets.cookie,
          "proxy-authorization": secrets.proxyAuthorization,
          ["x-api-key"]: secrets.apiKeyHeader,
          ["password"]: secrets.password,
          ["secret"]: secrets.secret,
          ["token"]: secrets.token,
          ["apiKey"]: secrets.apiKey,
          ["api_key"]: secrets.apiKeySnake,
          ["serviceRoleKey"]: secrets.serviceRoleKey,
          ["service_role_key"]: secrets.serviceRoleKeySnake,
          headers: request.headers,
          nested: {
            ["password"]: secrets.nestedPassword,
            ["secret"]: secrets.nestedSecret,
            ["token"]: secrets.nestedToken,
          },
        },
        "Synthetic redaction probe",
      );
      return { ok: true };
    });

    const response = await server.inject({
      method: "POST",
      url: "/__test__/redaction",
      headers: {
        authorization: secrets.authorization,
        cookie: secrets.cookie,
        "proxy-authorization": secrets.proxyAuthorization,
        ["x-api-key"]: secrets.apiKeyHeader,
      },
      payload: { harmless: true },
    });

    expect(response.statusCode).toBe(200);
    for (const secret of Object.values(secrets)) {
      expect(capture.text()).not.toContain(secret);
    }
    expect(capture.text()).toContain(REDACTED);
    const probe = capture.records().find((record) => record["msg"] === "Synthetic redaction probe");
    expect(probe).toBeDefined();
    expect(probe?.["authorization"]).toBe(REDACTED);
    expect(probe?.["password"]).toBe(REDACTED);
    expect(probe?.["token"]).toBe(REDACTED);
  });

  it("never logs raw exception messages, stacks, or request bodies", async () => {
    const capture = createLogCapture();
    const server = track(createServer({ logLevel: "info", loggerStream: capture.stream }));
    const exceptionSecret = "synthetic-exception-message-value";
    const stackSecret = "synthetic-exception-stack-value";
    const bodySecret = "synthetic-request-body-value";

    server.post("/__test__/log-exception", (request) => {
      const error = new Error(exceptionSecret);
      error.stack = stackSecret;
      request.log.error({ err: error }, "Synthetic controlled exception");
      throw error;
    });

    const response = await server.inject({
      method: "POST",
      url: "/__test__/log-exception",
      payload: { private_payload: bodySecret },
    });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(500);
    expect(payload.code).toBe("UNKNOWN");
    expect(capture.text()).not.toContain(exceptionSecret);
    expect(capture.text()).not.toContain(stackSecret);
    expect(capture.text()).not.toContain(bodySecret);

    const exceptionRecord = capture
      .records()
      .find((record) => record["msg"] === "Synthetic controlled exception");
    expect(exceptionRecord).toBeDefined();
    expect(exceptionRecord?.["err"]).toEqual({
      type: "Error",
      message: REDACTED,
      stack: REDACTED,
    });
  });
});
