import type { Identity } from "@dfinity/agent";
import { HttpAgent } from "@dfinity/agent";
import { resolveHost } from "../config";
import type { CanisterIds } from "../types";

export interface CanisterContext {
  agent: HttpAgent;
  canisterIds: CanisterIds;
}

export function createCanisterContext(opts: {
  icHost?: string;
  identity?: Identity;
  canisterIds: CanisterIds;
}): CanisterContext {
  const host = resolveHost(opts.icHost);

  const agent = HttpAgent.createSync({
    host,
    identity: opts.identity,
  });

  return {
    agent,
    canisterIds: opts.canisterIds,
  };
}
