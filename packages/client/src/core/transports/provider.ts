import type { Identity } from "@dfinity/agent";
import { HttpAgent } from "@dfinity/agent";
import { resolveHost } from "../config";
import type { CanisterIds } from "../types";

export interface InternalProvider {
  agent: HttpAgent;
  canisterIds: CanisterIds;
}

export function createProvider(opts: {
  host?: string;
  identity?: Identity;
  canisterIds: CanisterIds;
}): InternalProvider {
  const host = resolveHost(opts.host);

  const agent = HttpAgent.createSync({
    host,
    identity: opts.identity,
  });

  return {
    agent,
    canisterIds: opts.canisterIds,
  };
}
