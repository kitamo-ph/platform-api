import { describe, expect, it } from "vitest";

import {
  RuntimeConfigError,
  loadRuntimeConfig,
  type RuntimeEnvironmentSource,
} from "../../src/config/runtime-config.js";

describe("runtime configuration", () => {
  it("uses immutable, local-only development defaults", () => {
    const config = loadRuntimeConfig({});

    expect(config).toEqual({
      environment: "development",
      host: "127.0.0.1",
      port: 3000,
      logLevel: "info",
    });
    expect(Object.isFrozen(config)).toBe(true);
    expect(() => {
      (config as { host: string }).host = "localhost";
    }).toThrow(TypeError);
    expect(config.host).toBe("127.0.0.1");
  });

  it.each([
    ["test", "127.0.0.1", "1", "silent", 1],
    ["development", "127.0.0.1", "3000", "debug", 3000],
    ["test", "::1", "65535", "trace", 65535],
  ] as const)(
    "accepts %s on loopback host %s and port %s",
    (environment, host, port, logLevel, expectedPort) => {
      expect(
        loadRuntimeConfig({
          NODE_ENV: environment,
          HOST: host,
          PORT: port,
          LOG_LEVEL: logLevel,
        }),
      ).toEqual({ environment, host, port: expectedPort, logLevel });
    },
  );

  it("fails closed for production until deployment policy exists", () => {
    expect(() => loadRuntimeConfig({ NODE_ENV: "production" })).toThrow(
      new RuntimeConfigError(
        "Production startup is disabled until a deployment policy is approved.",
      ),
    );
  });

  it.each([
    ["environment", { NODE_ENV: "staging" }],
    ["empty environment", { NODE_ENV: "" }],
    ["public IPv4 host", { HOST: "0.0.0.0" }],
    ["public IPv6 host", { HOST: "::" }],
    ["hostname alias", { HOST: "localhost" }],
    ["external host", { HOST: "api.example.test" }],
    ["zero port", { PORT: "0" }],
    ["negative port", { PORT: "-1" }],
    ["overflow port", { PORT: "65536" }],
    ["decimal port", { PORT: "3000.5" }],
    ["padded port", { PORT: "03000" }],
    ["empty port", { PORT: "" }],
    ["uppercase log level", { LOG_LEVEL: "INFO" }],
    ["unsupported log level", { LOG_LEVEL: "off" }],
    ["empty log level", { LOG_LEVEL: "" }],
  ] satisfies readonly (readonly [string, RuntimeEnvironmentSource])[])(
    "rejects invalid %s configuration",
    (_label, env) => {
      expect(() => loadRuntimeConfig(env)).toThrow(RuntimeConfigError);
    },
  );
});
