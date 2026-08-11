import { Server } from "node:net";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";

describe("runtime import safety", () => {
  it("does not listen when the server factory or runtime entrypoint is imported", async () => {
    vi.resetModules();
    const listenSpy = vi.spyOn(Server.prototype, "listen");

    const serverModule = await import("../../src/transport/server.js");
    const runtimeModule = await import("../../src/runtime/start.js");

    expect(listenSpy).not.toHaveBeenCalled();
    const server = serverModule.createServer({ logLevel: "silent" });
    expect(listenSpy).not.toHaveBeenCalled();
    expect(server.server.listening).toBe(false);
    expect(server.addresses()).toEqual([]);
    expect(
      runtimeModule.isDirectRuntimeInvocation(import.meta.url, [
        "/usr/bin/node",
        "/tmp/not-the-runtime-entrypoint.js",
      ]),
    ).toBe(false);

    await server.close();
    listenSpy.mockRestore();
  });

  it("recognizes only the exact runtime module path as direct invocation", async () => {
    const { isDirectRuntimeInvocation } = await import("../../src/runtime/start.js");
    const entryPath = "/tmp/synthetic-runtime-start.js";

    expect(
      isDirectRuntimeInvocation(pathToFileURL(entryPath).href, ["/usr/bin/node", entryPath]),
    ).toBe(true);
    expect(isDirectRuntimeInvocation(pathToFileURL(entryPath).href, ["/usr/bin/node"])).toBe(false);
  });
});
