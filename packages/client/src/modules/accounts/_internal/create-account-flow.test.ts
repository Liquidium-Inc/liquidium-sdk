import { mockActor } from "../../../_internal/mock-actor";
import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import type { _SERVICE as LendingActor } from "../../../generated/canisters/lending/lending.did";
import { LiquidiumClient } from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("create account flow example", () => {
  test("shows how a client signs manually and submits the request", async () => {
    // given
    const registerProfile = vi
      .fn<LendingActor["register_profile"]>()
      .mockResolvedValue({
        Ok: Principal.fromText("aaaaa-aa"),
      });

    const getNonce = vi.fn().mockResolvedValue(7n);

    vi.spyOn(Actor, "createActor").mockReturnValue(
      mockActor({
        get_nonce: getNonce,
        get_wallet_profile: vi.fn().mockResolvedValue([]),
        register_profile: registerProfile,
      })
    );

    const walletClient = {
      getAddresses: vi.fn().mockResolvedValue(["0x123"]),
      signMessage: vi.fn().mockResolvedValue("0xabcdef"),
    };

    const client = new LiquidiumClient({});

    // when
    const [account] = await walletClient.getAddresses();

    if (!account) {
      throw new Error("Expected test wallet account");
    }

    const createAction = await client.accounts.prepareCreateProfile({
      account,
    });

    const signature = await walletClient.signMessage({
      account,
      message: createAction.message,
    });

    const profileId = await createAction.submit({
      signature,
      chain: "ETH",
      account,
    });

    // then
    expect(profileId).toBe("aaaaa-aa");
    expect(walletClient.getAddresses).toHaveBeenCalledTimes(1);
    expect(getNonce).toHaveBeenCalledWith("0x123");
    expect(walletClient.signMessage).toHaveBeenCalledWith({
      account: "0x123",
      message: expect.stringContaining("Liquidium: Initialize Account"),
    });

    const registerProfileRequest = registerProfile.mock.calls[0][0];

    expect(registerProfileRequest.data.expiry_timestamp).toBeTypeOf("bigint");
    expect(registerProfileRequest.signature_info).toEqual({
      Wallet: {
        signature: "abcdef",
        chain: { ETH: null },
        account: "0x123",
      },
    });
  });
});
