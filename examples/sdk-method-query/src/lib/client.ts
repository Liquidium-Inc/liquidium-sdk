import { LiquidiumClient } from "@liquidium/client";
import { resolveLiquidiumClientConfig } from "../liquidium-runtime-config";

export function createLiquidiumClient(): LiquidiumClient {
  return new LiquidiumClient(resolveLiquidiumClientConfig());
}
