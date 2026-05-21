import { LiquidiumClient } from "@liquidium/client";

export const client = new LiquidiumClient({});

export function formatConfig(): string {
  return [
    "Using Liquidium SDK defaults.",
    "Canisters: bundled mainnet defaults",
    "SDK API: bundled production default",
  ].join("\n");
}
