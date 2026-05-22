import type { Identity } from "@icp-sdk/core/agent";
import { HttpAgent } from "@icp-sdk/core/agent";
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
