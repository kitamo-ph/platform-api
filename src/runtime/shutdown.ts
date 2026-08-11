import type { PlatformServer } from "../transport/server.js";

export type ShutdownSignal = "SIGINT" | "SIGTERM";

export interface ShutdownController {
  readonly shutdown: (signal?: ShutdownSignal) => Promise<void>;
}

export interface ShutdownSignalSource {
  readonly once: (signal: ShutdownSignal, handler: () => void) => void;
  readonly off: (signal: ShutdownSignal, handler: () => void) => void;
  readonly setExitCode: (code: number) => void;
}

const NODE_SIGNAL_SOURCE: ShutdownSignalSource = {
  once(signal, handler) {
    process.once(signal, handler);
  },
  off(signal, handler) {
    process.off(signal, handler);
  },
  setExitCode(code) {
    process.exitCode = code;
  },
};

export function createShutdownController(server: PlatformServer): ShutdownController {
  let activeShutdown: Promise<void> | undefined;

  return {
    shutdown(signal) {
      activeShutdown ??= (async () => {
        server.log.info(
          { event: "runtime.shutdown", ...(signal === undefined ? {} : { signal }) },
          "Runtime shutdown started",
        );
        server.beginTransportDrain();
        await server.close();
        server.log.info({ event: "runtime.closed" }, "Runtime shutdown completed");
      })();
      return activeShutdown;
    },
  };
}

export function registerShutdownSignals(
  controller: ShutdownController,
  source: ShutdownSignalSource = NODE_SIGNAL_SOURCE,
): () => void {
  let disposed = false;
  const handlers = new Map<ShutdownSignal, () => void>();

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    for (const [signal, handler] of handlers) source.off(signal, handler);
    handlers.clear();
  };

  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    const handler = () => {
      void controller
        .shutdown(signal)
        .catch(() => source.setExitCode(1))
        .finally(dispose);
    };
    handlers.set(signal, handler);
    source.once(signal, handler);
  }

  return dispose;
}
