import type { Identity } from "@icp-sdk/core/agent";
import { HttpAgent } from "@icp-sdk/core/agent";
import { resolveHost } from "../config";
import type { CanisterIds } from "../types";

export interface CanisterContext {
  agent: HttpAgent;
  canisterIds: CanisterIds;
}

export interface CreateCanisterContextOptions {
  icHost?: string;
  identity?: Identity;
  canisterIds: CanisterIds;
}

export function createCanisterContext(
  opts: CreateCanisterContextOptions
): CanisterContext {
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
