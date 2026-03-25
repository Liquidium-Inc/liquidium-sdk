import { Actor } from "@dfinity/agent";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LiquidiumClient, LiquidiumError, LiquidiumErrorCode } from "../index";

afterEach(() => {
  vi.restoreAllMocks();
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
    const client = LiquidiumClient.create({});

    // when
    const createAction = await client.accounts.create({ account: "0xabc" });
    const profileId = await createAction.submit({
      signature: "0xsigned",
      chain: "ETH",
      account: "0xabc",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xabc");
    expect(createAction.kind).toBe("create-account");
    expect(createAction.account).toBe("0xabc");
    expect(createAction.message).toContain("Liquidium: Initialize Account");
    expect(profileId).toBe("ccccc-cc");
    expect(registerProfile).toHaveBeenCalledTimes(1);
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
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.accounts
        .create({ account: "0x123" })
        .then((createAction) =>
          createAction.submit({
            signature: "0xabc",
            chain: "ETH",
            account: "0x123",
          })
        )
    ).rejects.toMatchObject({ code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS });
  });

  test("blocks create action when wallet already has a profile", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: vi.fn().mockResolvedValue([
        { toText: () => "aaaaa-aa" },
      ]),
      get_nonce: vi.fn(),
      register_profile: vi.fn(),
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.accounts.create({ account: "0xabc" })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
      message: "Wallet address is already linked to profile aaaaa-aa",
    });
  });

  test("blocks action submission when wallet already has a profile", async () => {
    // given
    const registerProfile = vi.fn();
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_wallet_profile: vi.fn().mockResolvedValue([
        { toText: () => "bbbbb-bb" },
      ]),
      get_nonce: vi.fn(),
      register_profile: registerProfile,
    } as never);
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.accounts
        .create({ account: "0xabc" })
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
});

describe("HistoryModule", () => {
  test("throws SERVICE_UNAVAILABLE when no apiBaseUrl configured", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(client.history.getUser("profile-1")).rejects.toThrow(
      LiquidiumError
    );
    await expect(client.history.getUser("profile-1")).rejects.toMatchObject({
      code: LiquidiumErrorCode.SERVICE_UNAVAILABLE,
    });
  });
});

describe("LendingModule", () => {
  test("throws INTERNAL for borrow until implemented", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending.borrow({
        profileId: "p1",
        poolId: "pool1",
        amount: 50_000n,
        account: "bc1q...",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
    });
  });

  test("throws INTERNAL for withdraw until implemented", async () => {
    // given
    const client = LiquidiumClient.create({});

    // when / then
    await expect(
      client.lending.withdraw({
        profileId: "p1",
        poolId: "pool1",
        amount: 10_000n,
        account: "bc1q...",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.INTERNAL,
    });
  });
});
