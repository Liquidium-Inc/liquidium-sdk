import { Actor } from "@icp-sdk/core/agent";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LiquidiumClient } from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("create account flow example", () => {
  test("shows how a client signs manually and submits the request", async () => {
    // given
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "aaaaa-aa",
      },
    });
    const getNonce = vi.fn().mockResolvedValue(7n);

    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: getNonce,
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      register_profile: registerProfile,
    } as never);

    const walletClient = {
      getAddresses: vi.fn().mockResolvedValue(["0x123"]),
      signMessage: vi
        .fn()
        .mockImplementation(
          async ({ message }: { account: string; message: string }) => {
            void message;
            return "0xabcdef";
          }
        ),
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
    const registerProfileRequest = registerProfile.mock.calls[0][0] as {
      data: { expiry_timestamp: bigint };
      signature_info: {
        Wallet: {
          signature: string;
          chain: { ETH: null };
          account: string;
        };
      };
    };

    expect(typeof registerProfileRequest.data.expiry_timestamp).toBe("bigint");
    expect(registerProfileRequest.signature_info).toEqual({
      Wallet: {
        signature: "abcdef",
        chain: { ETH: null },
        account: "0x123",
      },
    });
  });
});
