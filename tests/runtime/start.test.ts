import { createServer as createNetServer } from "node:net";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";

import { StructuredErrorSchema } from "../../src/contracts/index.js";
import { startRuntime } from "../../src/runtime/start.js";
import { TestSignalSource } from "./test-signal-source.js";

async function availableLoopbackPort(): Promise<number> {
  const probe = createNetServer();
  await new Promise<void>((resolve, reject) => {
    probe.once("error", reject);
    probe.listen({ host: "127.0.0.1", port: 0 }, resolve);
  });
  const address = probe.address();
  if (address === null || typeof address === "string") {
    await new Promise<void>((resolve) => probe.close(() => resolve()));
    throw new Error("Could not reserve a synthetic loopback port.");
  }
  const port = address.port;
  await new Promise<void>((resolve, reject) => {
    probe.close((error) => (error === undefined ? resolve() : reject(error)));
  });
  return port;
}

describe("explicit runtime startup", () => {
  it("binds only to loopback and shuts down cleanly", async () => {
    const port = await availableLoopbackPort();
    const signalSource = new TestSignalSource();
    const runtime = await startRuntime({
      env: {
        NODE_ENV: "test",
        HOST: "127.0.0.1",
        PORT: String(port),
        LOG_LEVEL: "silent",
      },
      signalSource,
    });

    try {
      expect(runtime.address).toBe(`http://127.0.0.1:${String(port)}`);
      expect(runtime.server.server.listening).toBe(true);
      const address = runtime.server.server.address() as AddressInfo;
      expect(address.address).toBe("127.0.0.1");
      expect(address.port).toBe(port);

      const response = await fetch(`${runtime.address}/not-registered`);
      const rawPayload: unknown = await response.json();
      const payload = StructuredErrorSchema.parse(rawPayload);
      expect(response.status).toBe(404);
      expect(payload.code).toBe("NOT_FOUND");
      expect(payload.correlation_id).toBe(response.headers.get("x-request-id"));

      await runtime.shutdown("SIGTERM");
      expect(runtime.server.server.listening).toBe(false);
      expect(runtime.server.addresses()).toEqual([]);
      expect(signalSource.offCalls).toEqual(["SIGTERM", "SIGINT"]);
    } finally {
      await runtime.shutdown().catch(() => undefined);
    }
  });
});
