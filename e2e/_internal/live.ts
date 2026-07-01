import { describe } from "vitest";

const LIVE_E2E_ENABLED = process.env.LIQUIDIUM_LIVE_E2E === "1";

export const describeLive = LIVE_E2E_ENABLED ? describe : describe.skip;
