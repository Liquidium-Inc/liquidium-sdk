import type { Identity } from "@dfinity/agent";
import { HttpAgent } from "@dfinity/agent";
import { resolveHost } from "../config";
import type { CanisterIds } from "../types";

/**
 * Internal canister provider. Consumers never see this -- it backs
 * all canister-routed module methods.
 *
 * This is a placeholder that will be wired to generated canister
 * declarations once they are copied into this repo.
 */
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
