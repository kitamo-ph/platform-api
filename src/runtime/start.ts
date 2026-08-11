import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { createApp } from "../composition/create-app.js";
import {
  loadRuntimeConfig,
  type RuntimeConfig,
  type RuntimeEnvironmentSource,
} from "../config/runtime-config.js";
import {
  createShutdownController,
  registerShutdownSignals,
  type ShutdownController,
  type ShutdownSignal,
  type ShutdownSignalSource,
} from "./shutdown.js";
import type { PlatformServer } from "../transport/server.js";

export interface RuntimeHandle {
  readonly address: string;
  readonly config: RuntimeConfig;
  readonly server: PlatformServer;
  readonly shutdown: (signal?: ShutdownSignal) => Promise<void>;
}

export interface StartRuntimeOptions {
  readonly env?: RuntimeEnvironmentSource;
  readonly signalSource?: ShutdownSignalSource;
}

export interface RuntimeMainDependencies {
  readonly start: () => Promise<unknown>;
  readonly writeError: (message: string) => void;
  readonly setExitCode: (code: number) => void;
}

export async function startRuntime(options: StartRuntimeOptions = {}): Promise<RuntimeHandle> {
  const config = loadRuntimeConfig(options.env);
  const server = createApp({ logLevel: config.logLevel });
  const shutdownController: ShutdownController = createShutdownController(server);
  let disposeSignals: (() => void) | undefined;

  try {
    await server.ready();
    disposeSignals = registerShutdownSignals(shutdownController, options.signalSource);
    const address = await server.listen({ host: config.host, port: config.port });

    return {
      address,
      config,
      server,
      async shutdown(signal) {
        try {
          await shutdownController.shutdown(signal);
        } finally {
          disposeSignals?.();
        }
      },
    };
  } catch (error) {
    disposeSignals?.();
    await server.close().catch(() => undefined);
    throw error;
  }
}

export function isDirectRuntimeInvocation(
  moduleUrl: string,
  argv: readonly string[] = process.argv,
): boolean {
  const entry = argv[1];
  return entry !== undefined && pathToFileURL(resolve(entry)).href === moduleUrl;
}

export async function runRuntimeMain(
  dependencies: Partial<RuntimeMainDependencies> = {},
): Promise<void> {
  const start = dependencies.start ?? startRuntime;
  const writeError =
    dependencies.writeError ?? ((message: string) => process.stderr.write(message));
  const setExitCode = dependencies.setExitCode ?? ((code: number) => (process.exitCode = code));
  try {
    await start();
  } catch {
    writeError('{"level":"error","event":"runtime.startup_failed"}\n');
    setExitCode(1);
  }
}

if (isDirectRuntimeInvocation(import.meta.url)) {
  void runRuntimeMain();
}
