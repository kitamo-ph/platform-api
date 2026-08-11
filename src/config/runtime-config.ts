export type RuntimeEnvironment = "development" | "test";
export type RuntimeHost = "127.0.0.1" | "::1";
export type RuntimeLogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";

export interface RuntimeConfig {
  readonly environment: RuntimeEnvironment;
  readonly host: RuntimeHost;
  readonly port: number;
  readonly logLevel: RuntimeLogLevel;
}

export type RuntimeEnvironmentSource = Readonly<Record<string, string | undefined>>;

const ENVIRONMENTS = new Set<RuntimeEnvironment>(["development", "test"]);
const LOOPBACK_HOSTS = new Set<RuntimeHost>(["127.0.0.1", "::1"]);
const LOG_LEVELS = new Set<RuntimeLogLevel>([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);
const PORT_PATTERN =
  /^(?:[1-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/u;

export class RuntimeConfigError extends Error {
  public override readonly name = "RuntimeConfigError";
}

function parseEnvironment(value: string | undefined): RuntimeEnvironment {
  const candidate = value ?? "development";
  if (candidate === "production") {
    throw new RuntimeConfigError(
      "Production startup is disabled until a deployment policy is approved.",
    );
  }
  if (!ENVIRONMENTS.has(candidate as RuntimeEnvironment)) {
    throw new RuntimeConfigError("NODE_ENV must be development or test.");
  }
  return candidate as RuntimeEnvironment;
}

function parseHost(value: string | undefined): RuntimeHost {
  const candidate = value ?? "127.0.0.1";
  if (!LOOPBACK_HOSTS.has(candidate as RuntimeHost)) {
    throw new RuntimeConfigError("HOST must resolve to an approved loopback host.");
  }
  return candidate as RuntimeHost;
}

function parsePort(value: string | undefined): number {
  const candidate = value ?? "3000";
  if (!PORT_PATTERN.test(candidate)) {
    throw new RuntimeConfigError("PORT must be an integer from 1 through 65535.");
  }
  return Number(candidate);
}

function parseLogLevel(value: string | undefined): RuntimeLogLevel {
  const candidate = value ?? "info";
  if (!LOG_LEVELS.has(candidate as RuntimeLogLevel)) {
    throw new RuntimeConfigError("LOG_LEVEL is not supported.");
  }
  return candidate as RuntimeLogLevel;
}

export function loadRuntimeConfig(env: RuntimeEnvironmentSource = process.env): RuntimeConfig {
  return Object.freeze({
    environment: parseEnvironment(env["NODE_ENV"]),
    host: parseHost(env["HOST"]),
    port: parsePort(env["PORT"]),
    logLevel: parseLogLevel(env["LOG_LEVEL"]),
  });
}
