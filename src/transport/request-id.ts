import { randomUUID } from "node:crypto";

export const INTERNAL_REQUEST_ID_PREFIX = "req_";
export const INTERNAL_REQUEST_ID_MAX_LENGTH = 40;

export function generateInternalRequestId(): string {
  const requestId = `${INTERNAL_REQUEST_ID_PREFIX}${randomUUID()}`;
  if (requestId.length > INTERNAL_REQUEST_ID_MAX_LENGTH) {
    throw new Error("Generated request identifier exceeds its internal bound.");
  }
  return requestId;
}
