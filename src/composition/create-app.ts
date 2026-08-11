import { assertSharedContractsRuntimeIdentity } from "../contracts/index.js";
import {
  createServer,
  type CreateServerOptions,
  type PlatformServer,
} from "../transport/server.js";

export function createApp(options: CreateServerOptions = {}): PlatformServer {
  assertSharedContractsRuntimeIdentity();
  return createServer(options);
}
