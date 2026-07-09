import { Actor } from "@icp-sdk/core/agent";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  executeWith,
  LiquidiumClient,
  LiquidiumErrorCode,
} from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("AccountsModule", () => {
  test("prepares and submits an account creation request manually", async () => {
    // given
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "ccccc-cc",
      },
    });
    const getNonce = vi.fn().mockResolvedValue(11n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: getNonce,
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      register_profile: registerProfile,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const createAction = await client.accounts.prepareCreateProfile({
      account: "0xabc",
    });
    const profileId = await createAction.submit({
      signature: "0xsigned",
      chain: "ETH",
      account: "0xabc",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xabc");
    expect(createAction.kind).toBe("create-account");
    expect(createAction.executionKind).toBe("sign-message");
    expect(createAction.actionType).toBe("create-account");
    expect(createAction.account).toBe("0xabc");
    expect(createAction.message).toContain("Liquidium: Initialize Account");
    expect(profileId).toBe("ccccc-cc");
    expect(registerProfile).toHaveBeenCalledTimes(1);
  });

  test("executes an account creation action with a wallet adapter", async () => {
    // given
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "ccccc-cc",
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(11n),
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      register_profile: registerProfile,
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = new LiquidiumClient({});

    // when
    const profileId = await client.accounts
      .prepareCreateProfile({ account: "0xabc" })
      .then(
        executeWith({
          walletAdapter: { signMessage },
          chain: "ETH",
          account: "0xabc",
        })
      );

    // then
    expect(profileId).toBe("ccccc-cc");
    expect(signMessage).toHaveBeenCalledWith({
      actionType: "create-account",
      chain: "ETH",
      message: expect.stringContaining("Liquidium: Initialize Account"),
      account: "0xabc",
    });
    expect(registerProfile).toHaveBeenCalledTimes(1);
  });

  test("creates and executes an account creation request directly", async () => {
    // given
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "ddddd-dd",
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(13n),
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      register_profile: registerProfile,
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xabcdef");
    const client = new LiquidiumClient({});

    // when
    const profileId = await client.accounts.createProfile({
      account: "0xabc",
      chain: "ETH",
      walletAdapter: { signMessage },
    });

    // then
    expect(profileId).toBe("ddddd-dd");
    expect(signMessage).toHaveBeenCalledTimes(1);
    expect(registerProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        signature_info: expect.objectContaining({
          Wallet: expect.objectContaining({ signature: "abcdef" }),
        }),
      })
    );
  });

  test("should canonicalize Ethereum account casing before profile calls", async () => {
    // given
    const LOWERCASE_ETH_ADDRESS = "0x0fdc16c8ea36b2ebadcdc31a780759287120a5e5";
    const CHECKSUM_ETH_ADDRESS = "0x0fDC16C8EA36b2eBadCdC31A780759287120a5e5";
    const getWalletProfile = vi.fn().mockResolvedValue([]);
    const getNonce = vi.fn().mockResolvedValue(17n);
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "eeeee-ee",
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: getNonce,
      get_wallet_profile: getWalletProfile,
      register_profile: registerProfile,
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = new LiquidiumClient({});

    // when
    const profileId = await client.accounts.createProfile({
      account: LOWERCASE_ETH_ADDRESS,
      chain: "ETH",
      walletAdapter: { signMessage },
    });

    // then
    expect(profileId).toBe("eeeee-ee");
    expect(getWalletProfile).toHaveBeenCalledWith(CHECKSUM_ETH_ADDRESS);
    expect(getNonce).toHaveBeenCalledWith(CHECKSUM_ETH_ADDRESS);
    expect(signMessage).toHaveBeenCalledWith(
      expect.objectContaining({ account: CHECKSUM_ETH_ADDRESS })
    );
    expect(registerProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        signature_info: expect.objectContaining({
          Wallet: expect.objectContaining({ account: CHECKSUM_ETH_ADDRESS }),
        }),
      })
    );
  });

  test("should submit BTC profile signatures as hex bytes", async () => {
    // given
    const BTC_ADDRESS =
      "bc1pyt9znef2papnhjq7wgt065gp9g6yxcg6z8waurq59t995f6ru0qq5nxp3r";
    const BTC_SIGNATURE_BASE64 = "AQID/v8=";
    const registerProfile = vi.fn().mockResolvedValue({
      Ok: {
        toText: () => "fffff-ff",
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_nonce: vi.fn().mockResolvedValue(17n),
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      register_profile: registerProfile,
    } as never);
    const signMessage = vi.fn().mockResolvedValue(BTC_SIGNATURE_BASE64);
    const client = new LiquidiumClient({});

    // when
    const profileId = await client.accounts.createProfile({
      account: BTC_ADDRESS,
      chain: "BTC",
      walletAdapter: { signMessage },
    });

    // then
    const EXPECTED_SIGNATURE_HEX = "010203feff";
    expect(profileId).toBe("fffff-ff");
    expect(signMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        account: BTC_ADDRESS,
        chain: "BTC",
      })
    );
    expect(registerProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        signature_info: {
          Wallet: {
            signature: EXPECTED_SIGNATURE_HEX,
            chain: { BTC: null },
            account: BTC_ADDRESS,
          },
        },
      })
    );
  });

  test("maps protocol errors when account creation fails", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: vi.fn().mockResolvedValue([]),
      get_nonce: vi.fn().mockResolvedValue(7n),
      register_profile: vi.fn().mockResolvedValue({
        Err: { ProfileAlreadyExists: null },
      }),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.accounts
        .prepareCreateProfile({ account: "0x123" })
        .then((createAction) =>
          createAction.submit({
            signature: "0xabc",
            chain: "ETH",
            account: "0x123",
          })
        )
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
    });
  });

  test("prepares create action without checking for an existing profile", async () => {
    // given
    const getWalletProfile = vi
      .fn()
      .mockResolvedValue([{ toText: () => "aaaaa-aa" }]);
    const getNonce = vi.fn().mockResolvedValue(23n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: getWalletProfile,
      get_nonce: getNonce,
      register_profile: vi.fn(),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const createAction = await client.accounts.prepareCreateProfile({
      account: "0xabc",
    });

    // then
    expect(createAction.message).toContain("Nonce: 23");
    expect(getNonce).toHaveBeenCalledWith("0xabc");
    expect(getWalletProfile).not.toHaveBeenCalled();
  });

  test("blocks action submission when wallet already has a profile", async () => {
    // given
    const registerProfile = vi.fn();
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: vi
        .fn()
        .mockResolvedValue([{ toText: () => "bbbbb-bb" }]),
      get_nonce: vi.fn().mockResolvedValue(29n),
      register_profile: registerProfile,
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.accounts
        .prepareCreateProfile({ account: "0xabc" })
        .then((createAction) =>
          createAction.submit({
            signature: "0xsigned",
            chain: "ETH",
            account: "0xabc",
          })
        )
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
      message: "Wallet address is already linked to profile bbbbb-bb",
    });
    expect(registerProfile).not.toHaveBeenCalled();
  });

  test("returns wallets linked to a profile", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_wallets: vi.fn().mockResolvedValue([
        {
          address: "bc1qexample",
          chain: { Wallet: { BTC: null } },
        },
        {
          address: "0xabc",
          chain: { Wallet: { ETH: null } },
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const wallets = await client.accounts.listLinkedWallets("aaaaa-aa");

    // then
    expect(wallets).toEqual([
      {
        address: "bc1qexample",
        chain: "BTC",
      },
      {
        address: "0xabc",
        chain: "ETH",
      },
    ]);
  });

  test("throws when a profile contains an unsupported wallet chain", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_wallets: vi.fn().mockResolvedValue([
        {
          address: "So11111111111111111111111111111111111111112",
          chain: { Wallet: { SOL: null } },
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.accounts.listLinkedWallets("aaaaa-aa")
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
      message: "Unsupported wallet chain returned for profile wallet: SOL",
    });
  });

  test("rejects ICP as a profile signing wallet chain", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_profile_wallets: vi.fn().mockResolvedValue([
        {
          address: "aaaaa-aa",
          chain: { Wallet: { ICP: null } },
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.accounts.listLinkedWallets("aaaaa-aa")
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
      message: "Unsupported wallet chain returned for profile wallet: ICP",
    });
  });
});
