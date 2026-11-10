import { LiquidiumClient } from "@liquidium/client";

export const client = new LiquidiumClient({});

export function formatConfig(): string {
  return [
    "Using Liquidium SDK defaults.",
    "Canisters: bundled mainnet defaults",
    "Liquidium service: bundled production default",
    "Asset ledgers and minters use mainnet. Transfers use real assets.",
  ].join("\n");
}
