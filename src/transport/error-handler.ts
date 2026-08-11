import { errorCodes, type FastifyInstance, type FastifyRequest } from "fastify";

import {
  CorrelationIdSchema,
  StructuredErrorSchema,
  type StructuredError,
  type StructuredErrorCode,
} from "../contracts/index.js";

interface ErrorResponse {
  readonly statusCode: number;
  readonly payload: StructuredError;
}

const VALIDATION_CONTEXTS = new Set(["body", "headers", "params", "querystring"]);

export function createTransportErrorPayload(
  requestId: string,
  code: StructuredErrorCode,
  message: string,
  retryable = false,
): StructuredError {
  return StructuredErrorSchema.parse({
    code,
    message,
    correlation_id: CorrelationIdSchema.parse(requestId),
    retryable,
  });
}

function isSchemaValidationFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const record = error as Error & Record<string, unknown>;
  if (
    record["code"] !== "FST_ERR_VALIDATION" ||
    record["statusCode"] !== 400 ||
    typeof record["validationContext"] !== "string" ||
    !VALIDATION_CONTEXTS.has(record["validationContext"])
  ) {
    return false;
  }
  const validation = record["validation"];
  return (
    Array.isArray(validation) &&
    validation.length > 0 &&
    validation.every((issue: unknown) => {
      if (typeof issue !== "object" || issue === null) return false;
      const candidate = issue as Record<string, unknown>;
      return (
        typeof candidate["instancePath"] === "string" &&
        typeof candidate["schemaPath"] === "string" &&
        typeof candidate["keyword"] === "string" &&
        typeof candidate["params"] === "object" &&
        candidate["params"] !== null
      );
    })
  );
}

function classifyError(error: unknown, request: FastifyRequest): ErrorResponse {
  if (error instanceof errorCodes.FST_ERR_CTP_BODY_TOO_LARGE) {
    return {
      statusCode: 413,
      payload: createTransportErrorPayload(
        request.id,
        "VALIDATION_ERROR",
        "Request body exceeds the permitted size.",
      ),
    };
  }

  if (
    isSchemaValidationFailure(error) ||
    error instanceof errorCodes.FST_ERR_CTP_EMPTY_JSON_BODY ||
    error instanceof errorCodes.FST_ERR_CTP_INVALID_JSON_BODY ||
    error instanceof errorCodes.FST_ERR_CTP_INVALID_CONTENT_LENGTH ||
    error instanceof errorCodes.FST_ERR_CTP_INVALID_MEDIA_TYPE
  ) {
    return {
      statusCode: error instanceof errorCodes.FST_ERR_CTP_INVALID_MEDIA_TYPE ? 415 : 400,
      payload: createTransportErrorPayload(
        request.id,
        "VALIDATION_ERROR",
        "Request validation failed.",
      ),
    };
  }

  return {
    statusCode: 500,
    payload: createTransportErrorPayload(request.id, "UNKNOWN", "Internal server error."),
  };
}

export function installTransportErrorHandling(server: FastifyInstance): void {
  server.setNotFoundHandler((request, reply) => {
    reply.header("x-request-id", request.id);
    const payload = createTransportErrorPayload(request.id, "NOT_FOUND", "Route not found.");
    return reply.code(404).type("application/json; charset=utf-8").send(payload);
  });

  server.setErrorHandler((error, request, reply) => {
    const response = classifyError(error, request);
    if (response.statusCode >= 500) {
      request.log.error({ event: "request.failed" }, "Request failed safely");
    } else {
      request.log.warn(
        { event: "request.rejected", status_code: response.statusCode },
        "Request rejected safely",
      );
    }
    return reply
      .code(response.statusCode)
      .type("application/json; charset=utf-8")
      .send(response.payload);
  });
}
