import type { FastifyInstance, FastifyRequest } from "fastify";

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

const VALIDATION_ERROR_CODES = new Set([
  "FST_ERR_VALIDATION",
  "FST_ERR_CTP_EMPTY_JSON_BODY",
  "FST_ERR_CTP_INVALID_JSON_BODY",
  "FST_ERR_CTP_INVALID_CONTENT_LENGTH",
  "FST_ERR_CTP_INVALID_MEDIA_TYPE",
]);

export function createTransportErrorPayload(
  request: FastifyRequest,
  code: StructuredErrorCode,
  message: string,
  retryable = false,
): StructuredError {
  return StructuredErrorSchema.parse({
    code,
    message,
    correlation_id: CorrelationIdSchema.parse(request.id),
    retryable,
  });
}

function readFrameworkError(error: unknown): {
  readonly code: string | undefined;
} {
  if (typeof error !== "object" || error === null) {
    return { code: undefined };
  }
  const record = error as Record<string, unknown>;
  return {
    code: typeof record["code"] === "string" ? record["code"] : undefined,
  };
}

function isValidationFailure(code: string | undefined): boolean {
  return VALIDATION_ERROR_CODES.has(code ?? "");
}

function classifyError(error: unknown, request: FastifyRequest): ErrorResponse {
  const frameworkError = readFrameworkError(error);
  if (frameworkError.code === "FST_ERR_CTP_BODY_TOO_LARGE") {
    return {
      statusCode: 413,
      payload: createTransportErrorPayload(
        request,
        "VALIDATION_ERROR",
        "Request body exceeds the permitted size.",
      ),
    };
  }

  if (isValidationFailure(frameworkError.code)) {
    return {
      statusCode: frameworkError.code === "FST_ERR_CTP_INVALID_MEDIA_TYPE" ? 415 : 400,
      payload: createTransportErrorPayload(
        request,
        "VALIDATION_ERROR",
        "Request validation failed.",
      ),
    };
  }

  return {
    statusCode: 500,
    payload: createTransportErrorPayload(request, "UNKNOWN", "Internal server error."),
  };
}

export function installTransportErrorHandling(server: FastifyInstance): void {
  server.setNotFoundHandler((request, reply) => {
    const payload = createTransportErrorPayload(request, "NOT_FOUND", "Route not found.");
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
