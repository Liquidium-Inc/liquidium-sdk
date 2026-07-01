import { describe } from "vitest";

//const LIVE_E2E_ENABLED = process.env.LIQUIDIUM_LIVE_E2E === "1";
const LIVE_E2E_ENABLED = true;

export const describeLive = LIVE_E2E_ENABLED ? describe : describe.skip;
