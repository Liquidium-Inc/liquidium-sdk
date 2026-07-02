import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LiquidiumClient, LiquidiumErrorCode } from "../../../index";
import {
  BTC_POOL_ID,
  CHECKSUM_EVM_OUTFLOW_ADDRESS,
  createBtcPoolRecord,
  createIcpPoolRecord,
  createUsdtPoolRecord,
  ICP_POOL_ID,
  LOWERCASE_EVM_OUTFLOW_ADDRESS,
  USDT_POOL_ID,
  VALID_BTC_OUTFLOW_ADDRESS,
  VALID_IC_PRINCIPAL,
} from "./test-fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("LendingModule borrow", () => {
  test("creates and submits a borrow action with a custom outflow account", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const profileId = "aaaaa-aa";
    const poolId = "rrkah-fqaaa-aaaaa-aaaaq-cai";
    const getNonce = vi.fn().mockResolvedValue(17n);
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-1",
        txid: ["txid-1"],
        outflow_type: { Borrow: null },
        outflow_ref: ["ref-1"],
        amount: 50_000n,
        receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord(poolId)]),
      get_nonce: getNonce,
      borrow_assets: borrowAssets,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const borrowAction = await client.lending.prepareBorrow({
      profileId,
      poolId,
      amount: 50_000n,
      receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
      signerWalletAddress: "0xsigner",
    });
    const outflow = await borrowAction.submit({
      signature: "0xsigned",
      chain: "ETH",
    });

    // then
    expect(getNonce).toHaveBeenCalledWith("0xsigner");
    expect(borrowAction.kind).toBe("create-borrow");
    expect(borrowAction.executionKind).toBe("sign-message");
    expect(borrowAction.actionType).toBe("create-borrow");
    expect(borrowAction.transferMode).toBe("native");
    expect(borrowAction.account).toBe("0xsigner");
    expect(borrowAction.data).toMatchObject({
      profileId,
      poolId,
      amount: 50_000n,
      receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
      signerWalletAddress: "0xsigner",
    });
    expect(borrowAction.message).toBe(`Liquidium: Borrow Assets

Action: Borrow from pool
Pool ID: rrkah-fqaaa-aaaaa-aaaaq-cai
Amount: 50000
Address:${VALID_BTC_OUTFLOW_ADDRESS}
Expires: 1775001900
Nonce: 17`);
    expect(borrowAssets).toHaveBeenCalledTimes(1);
    expect(borrowAssets.mock.calls[0]?.[0]).toEqual(
      Principal.fromText(profileId)
    );
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      data: {
        expiry_timestamp: 1775001900n,
        account: { External: VALID_BTC_OUTFLOW_ADDRESS },
        pool_id: Principal.fromText(poolId),
        amount: 50_000n,
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
      id: "outflow-1",
      outflowType: "borrow",
      outflowRef: "ref-1",
      txid: "txid-1",
      amount: 50_000n,
      receiver: {
        type: "ChainAddress",
        address: VALID_BTC_OUTFLOW_ADDRESS,
      },
      status: {
        operation: "borrow",
        state: "confirming",
        confirmations: null,
        requiredConfirmations: null,
      },
    });
  });

  test("creates a BTC borrow action to an IC principal destination", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-principal",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 50_000n,
        receiver: { Native: Principal.fromText(VALID_IC_PRINCIPAL) },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(17n),
      borrow_assets: borrowAssets,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const borrowAction = await client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 50_000n,
      receiver: {
        address: VALID_IC_PRINCIPAL,
        type: "IcPrincipal",
      },
      signerWalletAddress: "0xsigner",
    });
    const outflow = await borrowAction.submit({
      signature: "0xsigned",
      chain: "ETH",
    });

    // then
    expect(borrowAction.transferMode).toBe("ck");
    expect(borrowAction.data.receiver).toEqual({
      address: VALID_IC_PRINCIPAL,
      type: "IcPrincipal",
    });
    expect(borrowAction.message).toContain(`Principal:${VALID_IC_PRINCIPAL}`);
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      data: {
        account: { Native: Principal.fromText(VALID_IC_PRINCIPAL) },
      },
    });
    expect(outflow.receiver).toEqual({
      type: "IcPrincipal",
      principal: VALID_IC_PRINCIPAL,
    });
  });

  test("creates an ICP borrow action to an ICRC destination", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const ICRC_SUBACCOUNT = new Uint8Array(32).fill(5);
    const ICRC_ACCOUNT = encodeIcrcAccount({
      owner: Principal.fromText(VALID_IC_PRINCIPAL),
      subaccount: ICRC_SUBACCOUNT,
    });
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-icp-icrc",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 100_000_000n,
        receiver: {
          Icrc: {
            owner: Principal.fromText(VALID_IC_PRINCIPAL),
            subaccount: [ICRC_SUBACCOUNT],
          },
        },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(17n),
      borrow_assets: borrowAssets,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const borrowAction = await client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: ICP_POOL_ID,
      amount: 100_000_000n,
      receiver: {
        address: ICRC_ACCOUNT,
      },
      signerWalletAddress: "0xsigner",
    });
    await borrowAction.submit({ signature: "0xsigned", chain: "ETH" });

    // then
    expect(borrowAction.transferMode).toBe("native");
    expect(borrowAction.message).toContain(`Icrc:${ICRC_ACCOUNT}`);
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
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

  test("rejects an ICRC destination for an ETH pool before fetching a nonce", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    const ICRC_ACCOUNT = encodeIcrcAccount({
      owner: Principal.fromText(VALID_IC_PRINCIPAL),
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 1_000_000n,
      receiver: {
        address: ICRC_ACCOUNT,
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

  test("rejects an invalid hinted IC principal borrow receiver before fetching a nonce", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 50_000n,
      receiver: {
        address: "not a principal",
        type: "IcPrincipal",
      },
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Invalid IcPrincipal outflow destination",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("rejects an invalid hinted ICRC borrow receiver before fetching a nonce", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: ICP_POOL_ID,
      amount: 100_000_000n,
      receiver: {
        address: VALID_BTC_OUTFLOW_ADDRESS,
        type: "IcrcAccount",
      },
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Invalid IcrcAccount outflow destination",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("rejects an invalid hinted ICP account identifier borrow receiver before fetching a nonce", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: ICP_POOL_ID,
      amount: 100_000_000n,
      receiver: {
        address: "not-an-account-identifier",
        type: "IcpAccountIdentifier",
      },
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Invalid IcpAccountIdentifier outflow destination",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("rejects a chain-address borrow receiver for an ICP pool before fetching a nonce", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: ICP_POOL_ID,
      amount: 100_000_000n,
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

  test("maps an ICRC receiver returned by a lending outflow", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const profileId = "aaaaa-aa";
    const poolId = "rrkah-fqaaa-aaaaa-aaaaq-cai";
    const ICRC_SUBACCOUNT = new Uint8Array(32).fill(9);
    const getNonce = vi.fn().mockResolvedValue(17n);
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-icrc",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 50_000n,
        receiver: {
          Icrc: {
            owner: Principal.fromText(profileId),
            subaccount: [ICRC_SUBACCOUNT],
          },
        },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord(poolId)]),
      get_nonce: getNonce,
      borrow_assets: borrowAssets,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const borrowAction = await client.lending.prepareBorrow({
      profileId,
      poolId,
      amount: 50_000n,
      receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
      signerWalletAddress: "0xsigner",
    });
    const outflow = await borrowAction.submit({
      signature: "0xsigned",
      chain: "ETH",
    });

    // then
    expect(outflow.receiver).toEqual({
      type: "IcrcAccount",
      owner: profileId,
      subaccount: ICRC_SUBACCOUNT,
      address: encodeIcrcAccount({
        owner: Principal.fromText(profileId),
        subaccount: ICRC_SUBACCOUNT,
      }),
    });
  });

  test("maps an account identifier receiver returned by a lending outflow", async () => {
    // given
    vi.setSystemTime(new Date("2026-04-01T00:00:00.000Z"));
    const profileId = "aaaaa-aa";
    const poolId = "rrkah-fqaaa-aaaaa-aaaaq-cai";
    const ACCOUNT_IDENTIFIER =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-account-id",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 50_000n,
        receiver: { AccountIdentifier: ACCOUNT_IDENTIFIER },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord(poolId)]),
      get_nonce: vi.fn().mockResolvedValue(17n),
      borrow_assets: borrowAssets,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const borrowAction = await client.lending.prepareBorrow({
      profileId,
      poolId,
      amount: 50_000n,
      receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
      signerWalletAddress: "0xsigner",
    });
    const outflow = await borrowAction.submit({
      signature: "0xsigned",
      chain: "ETH",
    });

    // then
    expect(outflow.receiver).toEqual({
      type: "IcpAccountIdentifier",
      accountIdentifier: ACCOUNT_IDENTIFIER,
    });
  });

  test("creates and executes a borrow request directly", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(31n),
      borrow_assets: vi.fn().mockResolvedValue({
        Ok: {
          id: "outflow-3",
          txid: [],
          outflow_type: { Borrow: null },
          outflow_ref: [],
          amount: 12_000n,
          receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
        },
      }),
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = new LiquidiumClient({});

    // when
    const outflow = await client.lending.borrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 12_000n,
      receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
      signerWalletAddress: "0xsigner",
      signerChain: "ETH",
      signerWalletAdapter: { signMessage },
    });

    // then
    expect(outflow.outflowType).toBe("borrow");
    expect(signMessage).toHaveBeenCalledWith({
      actionType: "create-borrow",
      transferMode: "native",
      chain: "ETH",
      message: expect.stringContaining("Liquidium: Borrow Assets"),
      account: "0xsigner",
    });
  });

  test("should submit eth borrow with a checksummed signer address", async () => {
    // given
    const LOWERCASE_SIGNER_ADDRESS =
      "0xa5789280df0d6e3f5bc9a00358379768e391bea9";
    const EXPECTED_CHECKSUM_SIGNER_ADDRESS =
      "0xA5789280dF0D6E3F5BC9a00358379768e391BEA9";
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-4",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 12_000n,
        receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
      },
    });
    const getNonce = vi.fn().mockResolvedValue(31n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
      borrow_assets: borrowAssets,
    } as never);
    const signMessage = vi.fn().mockResolvedValue("0xsigned");
    const client = new LiquidiumClient({});

    // when
    await client.lending.borrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 12_000n,
      receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
      signerWalletAddress: LOWERCASE_SIGNER_ADDRESS,
      signerChain: "ETH",
      signerWalletAdapter: { signMessage },
    });

    // then
    expect(getNonce).toHaveBeenCalledWith(EXPECTED_CHECKSUM_SIGNER_ADDRESS);
    expect(signMessage).toHaveBeenCalledWith(
      expect.objectContaining({ account: EXPECTED_CHECKSUM_SIGNER_ADDRESS })
    );
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      signature_info: {
        Wallet: {
          account: EXPECTED_CHECKSUM_SIGNER_ADDRESS,
        },
      },
    });
  });

  test("should submit eth borrow signatures without the 0x prefix", async () => {
    // given
    const SIGNATURE_WITH_PREFIX =
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b";
    const EXPECTED_SIGNATURE =
      "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b";
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-4",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 12_000n,
        receiver: { External: VALID_BTC_OUTFLOW_ADDRESS },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(31n),
      borrow_assets: borrowAssets,
    } as never);
    const signMessage = vi.fn().mockResolvedValue(SIGNATURE_WITH_PREFIX);
    const client = new LiquidiumClient({});

    // when
    await client.lending.borrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 12_000n,
      receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
      signerWalletAddress: "0xsigner",
      signerChain: "ETH",
      signerWalletAdapter: { signMessage },
    });

    // then
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      signature_info: {
        Wallet: {
          signature: EXPECTED_SIGNATURE,
          chain: { ETH: null },
          account: "0xsigner",
        },
      },
    });
  });

  test("maps protocol errors for createBorrow submission", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: vi.fn().mockResolvedValue(19n),
      borrow_assets: vi.fn().mockResolvedValue({
        Err: { BorrowingDisabled: null },
      }),
    } as never);
    const BTC_SIGNATURE_BASE64 = "AQID/v8=";
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending
        .prepareBorrow({
          profileId: "aaaaa-aa",
          poolId: BTC_POOL_ID,
          amount: 50_000n,
          receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
          signerWalletAddress: "bc1qsigner",
        })
        .then((borrowAction) =>
          borrowAction.submit({
            signature: BTC_SIGNATURE_BASE64,
            chain: "BTC",
          })
        )
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.BORROWING_DISABLED,
    });
  });

  test("validates createBorrow inputs", async () => {
    // given
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending.prepareBorrow({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 50_000n,
        receiver: { address: "   " },
        signerWalletAddress: "0xsigner",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow requires a custom outflow account",
    });
    await expect(
      client.lending.prepareBorrow({
        profileId: "p1",
        poolId: "aaaaa-aa",
        amount: 50_000n,
        receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
        signerWalletAddress: "  ",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow requires a signer account",
    });
  });

  test("rejects a BTC borrow below the asset minimum before signing", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 5_099n,
      receiver: { address: VALID_BTC_OUTFLOW_ADDRESS },
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow amount must be at least 5100 base units for BTC",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("rejects an ETH stablecoin borrow below the asset minimum before signing", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 999_999n,
      receiver: { address: LOWERCASE_EVM_OUTFLOW_ADDRESS },
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow amount must be at least 1000000 base units for USDT",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("rejects a borrow with an invalid BTC receiver address", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      amount: 50_000n,
      receiver: { address: "not-a-btc-address" },
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid mainnet BTC address",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("rejects a borrow with an invalid EVM receiver address", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: getNonce,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 1_000_000n,
      receiver: { address: "not-an-evm-address" },
      signerWalletAddress: "0xsigner",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid EVM address",
    });
    expect(getNonce).not.toHaveBeenCalled();
  });

  test("normalizes an EVM borrow receiver address", async () => {
    // given
    const getNonce = vi.fn().mockResolvedValue(17n);
    const borrowAssets = vi.fn().mockResolvedValue({
      Ok: {
        id: "outflow-evm",
        txid: [],
        outflow_type: { Borrow: null },
        outflow_ref: [],
        amount: 1_000_000n,
        receiver: { External: CHECKSUM_EVM_OUTFLOW_ADDRESS },
      },
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      get_nonce: getNonce,
      borrow_assets: borrowAssets,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const borrowAction = await client.lending.prepareBorrow({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      amount: 1_000_000n,
      receiver: { address: LOWERCASE_EVM_OUTFLOW_ADDRESS },
      signerWalletAddress: "0xsigner",
    });
    await borrowAction.submit({ signature: "0xsigned", chain: "ETH" });

    // then
    expect(borrowAction.data.receiver.address).toBe(
      CHECKSUM_EVM_OUTFLOW_ADDRESS
    );
    expect(borrowAction.message).toContain(
      `Address:${CHECKSUM_EVM_OUTFLOW_ADDRESS}`
    );
    expect(borrowAssets.mock.calls[0]?.[1]).toMatchObject({
      data: {
        account: { External: CHECKSUM_EVM_OUTFLOW_ADDRESS },
      },
    });
  });
});
