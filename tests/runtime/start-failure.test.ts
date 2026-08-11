import { beforeEach, describe, expect, it, vi } from "vitest";

import { TestSignalSource } from "./test-signal-source.js";

const runtimeFakes = vi.hoisted(() => {
  const ready = vi.fn<() => Promise<void>>();
  const listen = vi.fn<() => Promise<string>>();
  const close = vi.fn<() => Promise<void>>();
  const logInfo = vi.fn();
  const server = {
    ready,
    listen,
    close,
    log: { info: logInfo },
  };
  const createApp = vi.fn(() => server);
  return { close, createApp, listen, logInfo, ready };
});

vi.mock("../../src/composition/create-app.js", () => ({
  createApp: runtimeFakes.createApp,
}));

import { runRuntimeMain, startRuntime } from "../../src/runtime/start.js";

const VALID_ENV = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "32123",
  LOG_LEVEL: "silent",
} as const;

beforeEach(() => {
  vi.clearAllMocks();
  runtimeFakes.ready.mockResolvedValue(undefined);
  runtimeFakes.listen.mockResolvedValue("http://127.0.0.1:32123");
  runtimeFakes.close.mockResolvedValue(undefined);
});

describe("runtime startup failures", () => {
  it("emits one constant safe error and sets a non-zero exit code", async () => {
    const writeError = vi.fn<(message: string) => void>();
    const setExitCode = vi.fn<(code: number) => void>();
    const start = vi.fn<() => Promise<unknown>>(() =>
      Promise.reject(new Error("synthetic sensitive startup detail")),
    );

    await runRuntimeMain({ start, writeError, setExitCode });

    expect(writeError).toHaveBeenCalledOnce();
    expect(writeError).toHaveBeenCalledWith('{"level":"error","event":"runtime.startup_failed"}\n');
    expect(writeError.mock.calls[0]?.[0]).not.toContain("synthetic sensitive startup detail");
    expect(setExitCode).toHaveBeenCalledWith(1);
  });

  it("closes the server and removes signal handlers after bind failure", async () => {
    const signalSource = new TestSignalSource();
    runtimeFakes.listen.mockRejectedValueOnce(new Error("synthetic bind failure"));

    await expect(startRuntime({ env: VALID_ENV, signalSource })).rejects.toThrow(
      "synthetic bind failure",
    );

    expect(runtimeFakes.ready).toHaveBeenCalledTimes(1);
    expect(runtimeFakes.listen).toHaveBeenCalledWith({
      host: "127.0.0.1",
      port: 32123,
    });
    expect(runtimeFakes.close).toHaveBeenCalledTimes(1);
    expect(signalSource.onceCalls).toEqual(["SIGTERM", "SIGINT"]);
    expect(signalSource.offCalls).toEqual(["SIGTERM", "SIGINT"]);
    expect(signalSource.handlers.size).toBe(0);
  });

  it("closes a partially constructed server after readiness failure", async () => {
    const signalSource = new TestSignalSource();
    runtimeFakes.ready.mockRejectedValueOnce(new Error("synthetic initialization failure"));

    await expect(startRuntime({ env: VALID_ENV, signalSource })).rejects.toThrow(
      "synthetic initialization failure",
    );

    expect(runtimeFakes.listen).not.toHaveBeenCalled();
    expect(runtimeFakes.close).toHaveBeenCalledTimes(1);
    expect(signalSource.onceCalls).toEqual([]);
    expect(signalSource.offCalls).toEqual([]);
  });

  it("preserves the startup error even if defensive close also fails", async () => {
    runtimeFakes.listen.mockRejectedValueOnce(new Error("primary bind failure"));
    runtimeFakes.close.mockRejectedValueOnce(new Error("secondary close failure"));

    await expect(
      startRuntime({ env: VALID_ENV, signalSource: new TestSignalSource() }),
    ).rejects.toThrow("primary bind failure");
    expect(runtimeFakes.close).toHaveBeenCalledTimes(1);
  });
});
