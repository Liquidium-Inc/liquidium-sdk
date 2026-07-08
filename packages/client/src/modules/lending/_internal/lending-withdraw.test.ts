import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LiquidiumClient, LiquidiumErrorCode } from "../../../index";
import {
  BTC_POOL_ID,
  createBtcPoolRecord,
  createIcpPoolRecord,
  createUsdtPoolRecord,
  ICP_POOL_ID,
  LOWERCASE_EVM_OUTFLOW_ADDRESS,
  USDT_POOL_ID,
  VALID_BTC_OUTFLOW_ADDRESS,
  VALID_IC_PRINCIPAL,
  VALID_ICP_ACCOUNT_IDENTIFIER,
} from "./test-fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("LendingModule withdraw", () => {
  test("creates and submits a withdraw action with a custom outflow account", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const getNonce = vi.fn().mockResolvedValue(23n);
    const withdraw = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-2",
        txid: ["txid-2"],
        outflow_type: { Withdraw: null },
        outflow_ref: ["ref-2"],
        amount: 10_000n,
        receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
      withdraw,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const withdrawAction = await client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 10_000n,
      receiver: {
        address: VALID_BTC_OUTFLOW_ADDRESS,
        type: "ChainAddress",
      },
      signerWalletAddress: "0xsigner",
    });
    const outflow = await withdrawAction.submit({
      signature: "0xsigned",
      chain: "ETH",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xsigner");
    expect(withdrawAction.kind).toBe("create-withdraw");
    expect(withdrawAction.executionKind).toBe("sign-message");
    expect(withdrawAction.actionType).toBe("create-withdraw");
    expect(withdrawAction.transferMode).toBe("nativeAsset");
    expect(withdrawAction.account).toBe("0xsigner");
    expect(withdrawAction.data).toMatchObject({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 10_000n,
      receiver: {
        address: VALID_BTC_OUTFLOW_ADDRESS,
        type: "ChainAddress",
      },
      signerWalletAddress: "0xsigner",
    });
    expect(withdrawAction.message).toBe(`Liquidium: Withdraw Assets

Action: Withdraw from pool
Pool ID: hkmli-faaaa-aaaar-qb4ba-cai
Amount: 10000
Address:${VALID_BTC_OUTFLOW_ADDRESS}
Expires: 1775001900
Nonce: 23`);
    expect(withdraw).toHaveBeenCalledTimes(1);
    expect(withdraw.mock.calls[0]?.[0]).toEqual(Principal.fromText("aaaaa-aa"));
    expect(withdraw.mock.calls[0]?.[1]).toMatchObject({
      data: {
        expiry_timestamp: 1775001900n,
        account: { External: VALID_BTC_OUTFLOW_ADDRESS },
        pool_id: Principal.fromText(BTC_POOL_ID),
        amount: 10_000n,
      },
      signature_info: {
        Wallet: {
          signature: "0xsigned",
          chain: { ETH: null },
          account: "0xsigner",
        },
      },
    });
    expect(outflow).toEqual({
      id: "outflow-2",
      outflowType: "withdrawal",
      outflowRef: "ref-2",
      txid: "txid-2",
      amount: 10_000n,
      receiver: {
        type: "ChainAddress",
        address: VALID_BTC_OUTFLOW_ADDRESS,
      },
      status: {
        operation: "withdrawal",
        state: "confirming",
        confirmations: null,
        requiredConfirmations: null,
      },
    });
  });

  test("creates an ICP withdraw action to an account identifier destination", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const withdraw = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-icp-account-id",
        txid: [],
        outflow_type: { Withdraw: null },
        outflow_ref: [],
        amount: 10_000n,
        receiver: { AccountIdentifier: VALID_ICP_ACCOUNT_IDENTIFIER },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(23n),
      withdraw,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const withdrawAction = await client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: ICP_POOL_ID,
      amount: 10_000n,
      receiver: {
        address: VALID_ICP_ACCOUNT_IDENTIFIER,
        type: "IcpAccountIdentifier",
      },
      signerWalletAddress: "0xsigner",
    });
    await withdrawAction.submit({ signature: "0xsigned", chain: "ETH" });

    // then
    expect(withdrawAction.transferMode).toBe("nativeAsset");
    expect(withdrawAction.message).toContain(
      `AccountId:${VALID_ICP_ACCOUNT_IDENTIFIER}`
    );
    expect(withdraw.mock.calls[0]?.[1]).toMatchObject({
      data: {
        account: { AccountIdentifier: VALID_ICP_ACCOUNT_IDENTIFIER },
      },
    });
  });

  test("creates a BTC withdraw action to an ICRC destination", async () => {
    // given
    const ICRC_SUBACCOUNT = new Uint8Array(32).fill(6);
    const ICRC_ACCOUNT = encodeIcrcAccount({
      owner: Principal.fromText(VALID_IC_PRINCIPAL),
      subaccount: ICRC_SUBACCOUNT,
    });
    const withdraw = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-btc-icrc",
        txid: [],
        outflow_type: { Withdraw: null },
        outflow_ref: [],
        amount: 5_000n,
        receiver: {
          Icrc: {
            owner: Principal.fromText(VALID_IC_PRINCIPAL),
            subaccount: [ICRC_SUBACCOUNT],
          },
        },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(23n),
      withdraw,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const withdrawAction = await client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 5_000n,
      receiver: {
        address: ICRC_ACCOUNT,
        type: "IcrcAccount",
      },
      signerWalletAddress: "0xsigner",
    });
    await withdrawAction.submit({ signature: "0xsigned", chain: "ETH" });

    // then
    expect(withdrawAction.transferMode).toBe("ckLedger");
    expect(withdrawAction.message).toContain(`Icrc:${ICRC_ACCOUNT}`);
    expect(withdraw.mock.calls[0]?.[1]).toMatchObject({
      data: {
        account: {
          Icrc: {
            owner: Principal.fromText(VALID_IC_PRINCIPAL),
            subaccount: [ICRC_SUBACCOUNT],
          },
        },
      },
    });
  });

  test("creates an ETH stablecoin withdraw action to an ICRC destination", async () => {
    // given
    const ICRC_SUBACCOUNT = new Uint8Array(32).fill(7);
    const ICRC_ACCOUNT = encodeIcrcAccount({
      owner: Principal.fromText(VALID_IC_PRINCIPAL),
      subaccount: ICRC_SUBACCOUNT,
    });
    const withdraw = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-usdt-icrc",
        txid: [],
        outflow_type: { Withdraw: null },
        outflow_ref: [],
        amount: 1_000_000n,
        receiver: {
          Icrc: {
            owner: Principal.fromText(VALID_IC_PRINCIPAL),
            subaccount: [ICRC_SUBACCOUNT],
          },
        },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(23n),
      withdraw,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const withdrawAction = await client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 1_000_000n,
      receiver: {
        address: ICRC_ACCOUNT,
        type: "IcrcAccount",
      },
      signerWalletAddress: "0xsigner",
    });
    await withdrawAction.submit({ signature: "0xsigned", chain: "ETH" });

    // then
    expect(withdrawAction.transferMode).toBe("ckLedger");
    expect(withdrawAction.message).toContain(`Icrc:${ICRC_ACCOUNT}`);
    expect(withdraw.mock.calls[0]?.[1]).toMatchObject({
      data: {
        account: {
          Icrc: {
            owner: Principal.fromText(VALID_IC_PRINCIPAL),
            subaccount: [ICRC_SUBACCOUNT],
          },
        },
      },
    });
  });

  test("creates and executes a withdraw request directly", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(37n),
      withdraw: vi.fn().mockResolvedValue({
        Ok: {
          id: "outflow-4",
          txid: [],
          outflow_type: { Withdraw: null },
          outflow_ref: [],
          amount: 8_000n,
          receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
        },
      }),
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = new LiquidiumClient({});

    // when
    const outflow = await client.lending.withdraw({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 8_000n,
      receiver: VALID_BTC_OUTFLOW_ADDRESS,
      signerWalletAddress: "0xsigner",
      signerChain: "ETH",
      signerWalletAdapter: { signMessage },
    });

    // then
    expect(outflow.outflowType).toBe("withdrawal");
    expect(signMessage).toHaveBeenCalledWith({
      actionType: "create-withdraw",
      transferMode: "nativeAsset",
      chain: "ETH",
      message: expect.stringContaining("Liquidium: Withdraw Assets"),
      account: "0xsigner",
    });
  });

  test("maps protocol errors for withdraw submission", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(29n),
      withdraw: vi.fn().mockResolvedValue({
        Err: { InsufficientFunds: null },
      }),
    } as never);
    const BTC_SIGNATURE_BASE64 = "AQID/v8=";
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending
        .prepareWithdraw({
          profileId: "aaaaa-aa",
          poolId: BTC_POOL_ID,
          amount: 10_000n,
          receiver: VALID_BTC_OUTFLOW_ADDRESS,
          signerWalletAddress: "bc1qsigner",
        })
        .then((withdrawAction) =>
          withdrawAction.submit({
            signature: BTC_SIGNATURE_BASE64,
            chain: "BTC",
          })
        )
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.INSUFFICIENT_FUNDS,
    });
  });

  test("validates withdraw inputs", async () => {
    // given
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending.prepareWithdraw({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 10_000n,
        receiver: "   ",
        signerWalletAddress: "0xsigner",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw requires a custom outflow account",
    });
    await expect(
      client.lending.prepareWithdraw({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 10_000n,
        receiver: VALID_BTC_OUTFLOW_ADDRESS,
        signerWalletAddress: "  ",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw requires a signer account",
    });
    await expect(
      client.lending.prepareWithdraw({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 0n,
        receiver: VALID_BTC_OUTFLOW_ADDRESS,
        signerWalletAddress: "0xsigner",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw amount must be greater than 0",
    });
  });

  test("rejects a BTC withdraw below the asset minimum before signing", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 4_999n,
      receiver: VALID_BTC_OUTFLOW_ADDRESS,
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw amount must be at least 5000 base units for BTC",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("allows a BTC withdraw equal to the asset minimum", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const withdrawAction = await client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 5_000n,
      receiver: VALID_BTC_OUTFLOW_ADDRESS,
      signerWalletAddress: "0xsigner",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xsigner");
    expect(withdrawAction.message).toContain("Amount: 5000");
  });

  test("rejects an ETH stablecoin withdraw below the asset minimum before signing", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 999_999n,
      receiver: LOWERCASE_EVM_OUTFLOW_ADDRESS,
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Withdraw amount must be at least 1000000 base units for USDT",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("allows an ETH stablecoin withdraw equal to the asset minimum", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const withdrawAction = await client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 1_000_000n,
      receiver: LOWERCASE_EVM_OUTFLOW_ADDRESS,
      signerWalletAddress: "0xsigner",
    });

    // then
    expect(withdrawAction.data.amount).toBe(1_000_000n);
    expect(getNonce).toHaveBeenCalledWith("0xsigner");
  });

  test("rejects a BTC L1 withdraw receiver for an ICP pool before fetching a nonce", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: ICP_POOL_ID,
      amount: 10_000n,
      receiver: {
        address: VALID_BTC_OUTFLOW_ADDRESS,
        type: "ChainAddress",
      },
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Target pool does not support this address type",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("rejects an ETH L1 withdraw receiver for an ICP pool before fetching a nonce", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: ICP_POOL_ID,
      amount: 10_000n,
      receiver: {
        address: LOWERCASE_EVM_OUTFLOW_ADDRESS,
        type: "ChainAddress",
      },
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Target pool does not support this address type",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("rejects a withdraw with an invalid EVM receiver address", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 1_000_000n,
      receiver: "not-an-evm-address",
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid EVM address",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("rejects a withdraw with an invalid BTC receiver address", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareWithdraw({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 5_000n,
      receiver: "not-a-btc-address",
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid mainnet BTC address",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });
});
