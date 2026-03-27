import type { Identity } from "@dfinity/agent";
import { HttpAgent } from "@dfinity/agent";
import { resolveHost } from "../config";
import type { CanisterIds } from "../types";

export interface CanisterContext {
  agent: HttpAgent;
  canisterIds: CanisterIds;
}

export function createCanisterContext(opts: {
  host?: string;
  identity?: Identity;
  canisterIds: CanisterIds;
}): CanisterContext {
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
