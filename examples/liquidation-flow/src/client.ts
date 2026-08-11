import type { HttpAgent } from "@icp-sdk/core/agent";
import { LiquidiumClient } from "@liquidium/client";

interface CreateClientParams {
  agent: HttpAgent;
  lendingCanisterId: string;
}

export function createClient({
  agent,
  lendingCanisterId,
}: CreateClientParams): LiquidiumClient {
  return new LiquidiumClient({
    agent,
    canisterIds: { lending: lendingCanisterId },
  });
}
