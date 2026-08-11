import { describe, expect, it, vi } from "vitest";

import { createServer } from "../../src/transport/server.js";
import {
  createShutdownController,
  registerShutdownSignals,
  type ShutdownController,
  type ShutdownSignal,
} from "../../src/runtime/shutdown.js";
import { TestSignalSource } from "./test-signal-source.js";

describe("graceful shutdown", () => {
  it("closes the server exactly once and shares an active shutdown promise", async () => {
    const server = createServer({ logLevel: "silent" });
    await server.ready();
    const closeSpy = vi.spyOn(server, "close");
    const drainSpy = vi.spyOn(server, "beginTransportDrain");
    const controller = createShutdownController(server);

    const first = controller.shutdown("SIGTERM");
    const second = controller.shutdown("SIGINT");

    expect(second).toBe(first);
    await Promise.all([first, second]);
    expect(drainSpy).toHaveBeenCalledTimes(1);
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(server.server.listening).toBe(false);
    expect(server.addresses()).toEqual([]);
  });

  it("registers both signals and removes both handlers after successful shutdown", async () => {
    const source = new TestSignalSource();
    const shutdown = vi.fn<(signal?: ShutdownSignal) => Promise<void>>(() => Promise.resolve());
    const controller: ShutdownController = { shutdown };

    registerShutdownSignals(controller, source);
    expect(source.onceCalls).toEqual(["SIGTERM", "SIGINT"]);

    source.emit("SIGTERM");
    await vi.waitFor(() => {
      expect(shutdown).toHaveBeenCalledWith("SIGTERM");
      expect(source.offCalls).toEqual(["SIGTERM", "SIGINT"]);
    });
    expect(source.handlers.size).toBe(0);
    expect(source.exitCodes).toEqual([]);
  });

  it("sets a failing exit code and still removes signal handlers on shutdown error", async () => {
    const source = new TestSignalSource();
    const shutdown = vi.fn<(signal?: ShutdownSignal) => Promise<void>>(() =>
      Promise.reject(new Error("synthetic close failure")),
    );

    registerShutdownSignals({ shutdown }, source);
    source.emit("SIGINT");

    await vi.waitFor(() => {
      expect(source.exitCodes).toEqual([1]);
      expect(source.offCalls).toEqual(["SIGTERM", "SIGINT"]);
    });
    expect(source.handlers.size).toBe(0);
  });

  it("returns an idempotent explicit cleanup function", () => {
    const source = new TestSignalSource();
    const controller: ShutdownController = {
      shutdown: () => Promise.resolve(),
    };
    const dispose = registerShutdownSignals(controller, source);

    dispose();
    dispose();

    expect(source.offCalls).toEqual(["SIGTERM", "SIGINT"]);
    expect(source.handlers.size).toBe(0);
  });
});
