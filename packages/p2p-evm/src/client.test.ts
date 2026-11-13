import { describe, expect, it } from "vitest";
import { createFakePublicClient } from "./_internal/test-fixtures";
import { P2pEvmClient } from "./client";
import { ROBINHOOD_CHAIN_ID } from "./core/config";
import { P2pEvmErrorCode } from "./core/errors";

describe("P2pEvmClient", () => {
  it("requires a LoanCore address on chains it does not know", () => {
    const publicClient = createFakePublicClient();

    expect(
      () => new P2pEvmClient({ chainId: 999_999, publicClient })
    ).toThrowError(
      expect.objectContaining({ code: P2pEvmErrorCode.VALIDATION_ERROR })
    );
    expect(
      () => new P2pEvmClient({ chainId: ROBINHOOD_CHAIN_ID, publicClient })
    ).not.toThrow();
  });

  it("asks for a partner id only when a call needs one", async () => {
    const publicClient = createFakePublicClient();
    const client = new P2pEvmClient({
      chainId: ROBINHOOD_CHAIN_ID,
      publicClient,
    });

    await expect(
      client.revenue.getClaimable("0x4000000000000000000000000000000000000004")
    ).rejects.toMatchObject({ code: P2pEvmErrorCode.VALIDATION_ERROR });
  });
});
