import type { Agent, Identity } from "@icp-sdk/core/agent";
import { HttpAgent } from "@icp-sdk/core/agent";
import { resolveHost } from "../config";
import type { CanisterIds } from "../types";

export interface CanisterContext {
  agent: Agent;
  canisterIds: CanisterIds;
}

interface CreateCanisterContextOptions {
  agent?: Agent;
  icHost?: string;
  identity?: Identity;
  canisterIds: CanisterIds;
}

export function createCanisterContext(
  opts: CreateCanisterContextOptions
): CanisterContext {
  if (opts.agent) {
    return {
      agent: opts.agent,
      canisterIds: opts.canisterIds,
    };
  }

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
