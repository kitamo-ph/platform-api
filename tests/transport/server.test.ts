import { errorCodes, type FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";

import { CorrelationIdSchema, StructuredErrorSchema } from "../../src/contracts/index.js";
import { createApp } from "../../src/composition/create-app.js";
import {
  TRANSPORT_BODY_LIMIT_BYTES,
  createServer,
  type PlatformServer,
} from "../../src/transport/server.js";
import {
  INTERNAL_REQUEST_ID_MAX_LENGTH,
  INTERNAL_REQUEST_ID_PREFIX,
} from "../../src/transport/request-id.js";

const servers = new Set<FastifyInstance>();

function track<T extends FastifyInstance>(server: T): T {
  servers.add(server);
  return server;
}

function createSyntheticServer(): PlatformServer {
  const server = track(createServer({ logLevel: "silent" }));

  server.get("/__test__/ok", (request) => ({
    ok: true,
    request_id: request.id,
  }));

  server.get<{ Querystring: { readonly spoof?: string } }>("/__test__/throw", (request) => {
    if (request.query.spoof === "actual-content-length") {
      throw new errorCodes.FST_ERR_CTP_INVALID_CONTENT_LENGTH();
    }
    const error = new Error("synthetic internal exception must not escape") as Error & {
      code?: string;
      validation?: readonly unknown[];
    };
    error.code =
      request.query.spoof === "body-too-large"
        ? "FST_ERR_CTP_BODY_TOO_LARGE"
        : "FST_ERR_VALIDATION";
    error.validation = [{ synthetic: true }];
    throw error;
  });

  server.post<{ Body: { value: string } }>(
    "/__test__/payload",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["value"],
          properties: {
            value: { type: "string", minLength: 1 },
          },
        },
      },
    },
    (request) => ({ value: request.body.value }),
  );

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

describe("transport construction and route surface", () => {
  it("constructs and becomes ready without binding a network listener", async () => {
    const server = track(createServer({ logLevel: "silent" }));

    expect(server.server.listening).toBe(false);
    expect(server.addresses()).toEqual([]);
    expect(server.initialConfig.bodyLimit).toBe(TRANSPORT_BODY_LIMIT_BYTES);
    expect(server.initialConfig.requestIdHeader).toBe(false);
    expect(server.initialConfig.onProtoPoisoning).toBe("error");
    expect(server.initialConfig.onConstructorPoisoning).toBe("error");

    await server.ready();

    expect(server.server.listening).toBe(false);
    expect(server.addresses()).toEqual([]);
  });

  it("registers zero production or operational routes", async () => {
    const server = track(createApp({ logLevel: "silent" }));
    await server.ready();

    expect(server.printRoutes()).toBe("(empty tree)");

    const prohibitedPaths = [
      "/health",
      "/api/v1/users",
      "/api/v1/businesses",
      "/api/v1/stalls",
      "/api/v1/devices",
      "/api/v1/sales",
      "/api/v1/inventory",
      "/api/v1/recipes",
      "/api/v1/production",
      "/api/v1/reports",
      "/api/v1/sync",
      "/api/v1/problem-reports",
      "/api/v1/audit",
      "/api/v1/admin",
      "/api/v1/customers",
    ] as const;

    for (const url of prohibitedPaths) {
      expect(server.hasRoute({ method: "GET", url }), url).toBe(false);
      expect(server.hasRoute({ method: "POST", url }), url).toBe(false);
    }
  });

  it("supports synthetic injection routes registered only by the test", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({ method: "GET", url: "/__test__/ok" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ ok: true });
    expect(server.server.listening).toBe(false);
    expect(server.addresses()).toEqual([]);
  });
});

describe("request identifiers and proxy trust", () => {
  it("owns a bounded request ID and returns the same value in x-request-id", async () => {
    const server = createSyntheticServer();

    const first = await server.inject({ method: "GET", url: "/__test__/ok" });
    const second = await server.inject({ method: "GET", url: "/__test__/ok" });
    const firstPayload = first.json<{ request_id: string }>();
    const secondPayload = second.json<{ request_id: string }>();

    expect(CorrelationIdSchema.parse(firstPayload.request_id)).toBe(firstPayload.request_id);
    expect(firstPayload.request_id).toMatch(
      new RegExp(`^${INTERNAL_REQUEST_ID_PREFIX}[0-9a-f-]+$`, "u"),
    );
    expect(firstPayload.request_id.length).toBeLessThanOrEqual(INTERNAL_REQUEST_ID_MAX_LENGTH);
    expect(first.headers["x-request-id"]).toBe(firstPayload.request_id);
    expect(second.headers["x-request-id"]).toBe(secondPayload.request_id);
    expect(secondPayload.request_id).not.toBe(firstPayload.request_id);
  });

  it("ignores caller-controlled request identifier headers", async () => {
    const server = createSyntheticServer();
    const callerValue = "caller_controlled_request_identifier";

    const response = await server.inject({
      method: "GET",
      url: "/__test__/ok",
      headers: {
        "request-id": callerValue,
        "x-request-id": callerValue,
      },
    });
    const payload = response.json<{ request_id: string }>();

    expect(payload.request_id).not.toBe(callerValue);
    expect(response.headers["x-request-id"]).toBe(payload.request_id);
  });

  it("does not trust spoofable forwarding headers", async () => {
    const server = track(createServer({ logLevel: "silent" }));
    server.get("/__test__/proxy", (request) => ({
      host: request.host,
      ip: request.ip,
      ips: request.ips,
      protocol: request.protocol,
    }));

    const response = await server.inject({
      method: "GET",
      url: "/__test__/proxy",
      headers: {
        host: "loopback.test",
        "x-forwarded-for": "203.0.113.42",
        "x-forwarded-host": "spoofed.example",
        "x-forwarded-proto": "https",
      },
    });
    const payload = response.json<{
      host: string;
      ip: string;
      ips?: string[];
      protocol: string;
    }>();

    expect(payload.ip).not.toBe("203.0.113.42");
    expect(payload.ips).toBeUndefined();
    expect(payload.host).toBe("loopback.test");
    expect(payload.protocol).toBe("http");
  });
});

describe("safe framework errors", () => {
  it("returns a Shared Contracts NOT_FOUND error for an unknown route", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({ method: "GET", url: "/not-registered" });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(404);
    expect(payload).toEqual({
      code: "NOT_FOUND",
      message: "Route not found.",
      correlation_id: response.headers["x-request-id"],
      retryable: false,
    });
  });

  it("maps an unhandled route exception to a bounded UNKNOWN error", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({ method: "GET", url: "/__test__/throw" });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(500);
    expect(payload).toEqual({
      code: "UNKNOWN",
      message: "Internal server error.",
      correlation_id: response.headers["x-request-id"],
      retryable: false,
    });
    expect(response.body).not.toContain("synthetic internal exception");
    expect(response.body).not.toContain("stack");
  });

  it("does not trust spoofed Fastify parser error codes", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({
      method: "GET",
      url: "/__test__/throw?spoof=body-too-large",
    });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(500);
    expect(payload.code).toBe("UNKNOWN");
    expect(payload.message).toBe("Internal server error.");
  });

  it("recognizes Fastify's invalid-content-length error constructor", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({
      method: "GET",
      url: "/__test__/throw?spoof=actual-content-length",
    });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(400);
    expect(payload.code).toBe("VALIDATION_ERROR");
    expect(payload.message).toBe("Request validation failed.");
  });

  it("returns a bounded SERVICE_UNAVAILABLE error after transport drain begins", async () => {
    const server = createSyntheticServer();
    server.beginTransportDrain();

    const response = await server.inject({ method: "GET", url: "/__test__/ok" });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(503);
    expect(payload).toEqual({
      code: "SERVICE_UNAVAILABLE",
      message: "Service temporarily unavailable.",
      correlation_id: response.headers["x-request-id"],
      retryable: true,
    });
    expect(response.body).not.toContain("Service Unavailable");
  });

  it("sanitizes schema validation failures", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({
      method: "POST",
      url: "/__test__/payload",
      payload: {},
    });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(400);
    expect(payload.code).toBe("VALIDATION_ERROR");
    expect(payload.message).toBe("Request validation failed.");
    expect(payload.correlation_id).toBe(response.headers["x-request-id"]);
    expect(response.body).not.toContain("required property");
    expect(response.body).not.toContain("instancePath");
  });

  it("sanitizes malformed JSON", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({
      method: "POST",
      url: "/__test__/payload",
      headers: { "content-type": "application/json" },
      payload: '{"value":',
    });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(400);
    expect(payload.code).toBe("VALIDATION_ERROR");
    expect(payload.message).toBe("Request validation failed.");
    expect(response.body).not.toContain("Unexpected end");
  });

  it("sanitizes an empty JSON body", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({
      method: "POST",
      url: "/__test__/payload",
      headers: { "content-type": "application/json" },
      payload: "",
    });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(400);
    expect(payload.code).toBe("VALIDATION_ERROR");
    expect(payload.message).toBe("Request validation failed.");
  });

  it("keeps malformed URL errors correlated without exposing router internals", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({ method: "GET", url: "/%world" });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(404);
    expect(payload.code).toBe("NOT_FOUND");
    expect(payload.correlation_id).toBe(response.headers["x-request-id"]);
    expect(response.body).not.toContain("FST_ERR_BAD_URL");
  });

  it("rejects oversized payloads at the transport boundary", async () => {
    const server = createSyntheticServer();

    const response = await server.inject({
      method: "POST",
      url: "/__test__/payload",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ value: "x".repeat(TRANSPORT_BODY_LIMIT_BYTES) }),
    });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(413);
    expect(payload.code).toBe("VALIDATION_ERROR");
    expect(payload.message).toBe("Request body exceeds the permitted size.");
  });

  it.each([
    ["text/plain", "synthetic plain-text payload"],
    ["application/xml", "<synthetic>payload</synthetic>"],
  ])("rejects unsupported %s bodies", async (contentType, body) => {
    const server = createSyntheticServer();

    const response = await server.inject({
      method: "POST",
      url: "/__test__/payload",
      headers: { "content-type": contentType },
      payload: body,
    });
    const payload = StructuredErrorSchema.parse(response.json());

    expect(response.statusCode).toBe(415);
    expect(payload.code).toBe("VALIDATION_ERROR");
    expect(payload.message).toBe("Request validation failed.");
    expect(response.body).not.toContain(body);
  });
});

describe("server identification", () => {
  it("removes Server and X-Powered-By headers even when a route sets them", async () => {
    const server = track(createServer({ logLevel: "silent" }));
    server.get("/__test__/headers", (_request, reply) => {
      reply.header("server", "synthetic-framework-name");
      reply.header("x-powered-by", "synthetic-runtime-name");
      return { ok: true };
    });

    const response = await server.inject({ method: "GET", url: "/__test__/headers" });

    expect(response.statusCode).toBe(200);
    expect(response.headers.server).toBeUndefined();
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("does not emit wildcard CORS headers", async () => {
    const server = createSyntheticServer();
    const response = await server.inject({
      method: "GET",
      url: "/__test__/ok",
      headers: { origin: "https://synthetic.example" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    expect(response.headers["access-control-allow-credentials"]).toBeUndefined();
  });
});
