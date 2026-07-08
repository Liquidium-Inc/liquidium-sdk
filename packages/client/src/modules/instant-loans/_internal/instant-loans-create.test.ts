import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_API_BASE_URL } from "../../../core/config";
import {
  type CreateInstantLoanRequest,
  LiquidiumClient,
  LiquidiumErrorCode,
} from "../../../index";
import {
  ACCOUNT_IDENTIFIER,
  BTC_POOL_ID,
  CHECKSUM_EVM_BORROW_ADDRESS,
  createBtcPoolRecord,
  createIcpPoolRecord,
  createInstantLoan,
  createUsdtPoolRecord,
  encodeIcrcAccount,
  ICP_POOL_ID,
  ICRC_SUBACCOUNT,
  LOAN_ID,
  LOWERCASE_EVM_BORROW_ADDRESS,
  PROFILE_ID,
  prices,
  USDT_POOL_ID,
  VALID_BTC_REFUND_ADDRESS,
} from "./test-fixtures";

const VALID_ICRC_DESTINATION = encodeIcrcAccount({
  owner: Principal.fromText(PROFILE_ID),
  subaccount: ICRC_SUBACCOUNT,
});
const DEFAULT_COLLATERAL_AMOUNT_BASE_UNITS = 10_000_000n;
const DEFAULT_BORROW_AMOUNT_BASE_UNITS = 5_726_000_000n;
const DEFAULT_ICP_AMOUNT_E8S = 1_000_000n;
const DEFAULT_LTV_MAX_BPS = 6_000n;
const DEFAULT_DEPOSIT_WINDOW_SECONDS = 3_600n;

interface InstantLoanDestinationValidationCase {
  name: string;
  requestOverrides: Partial<CreateInstantLoanRequest>;
  expectedCode: LiquidiumErrorCode;
  expectedMessage: string;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("InstantLoansModule create", () => {
  test("creates a loan through the default SDK API and hydrates canonical canister state", async () => {
    // given
    const BTC_MINTER_DEPOSIT_FEE_SATS = 2_000n;
    const CKBTC_LEDGER_FEE_SATS = 10n;
    const EXPIRY_TIMESTAMP_SECONDS = 1_775_235_600n;
    const getLoan = vi.fn().mockResolvedValue({
      Ok: createInstantLoan({ expires_at: [EXPIRY_TIMESTAMP_SECONDS] }),
    });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input, init) => {
        const url = input.toString();
        if (init?.method === "POST") {
          return new Response(
            JSON.stringify({
              success: true,
              loan: {
                loanId: LOAN_ID.toString(),
                collateral: {
                  amountHint: "10000000",
                },
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        if (url.includes("/activities?")) {
          return new Response(JSON.stringify({ activities: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ error: "not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        });
      });

    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([
            createBtcPoolRecord({ max_ltv: 6_500n }),
            createUsdtPoolRecord(),
          ]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never)
      .mockReturnValueOnce({ get_loan: getLoan } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qinstantdeposit"),
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: vi.fn().mockResolvedValue({
          Ok: "0x1111111111111111111111111111111111111111",
        }),
      } as never)
      .mockReturnValueOnce({
        get_deposit_fee: vi.fn().mockResolvedValue(BTC_MINTER_DEPOSIT_FEE_SATS),
      } as never)
      .mockReturnValueOnce({
        icrc1_fee: vi.fn().mockResolvedValue(CKBTC_LEDGER_FEE_SATS),
      } as never);
    const client = new LiquidiumClient({
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: {
        type: "ChainAddress",
        address: LOWERCASE_EVM_BORROW_ADDRESS,
      },
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    const EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS = 10_000_000n + 2_500n;

    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v1/instant-loans`,
      expect.objectContaining({
        body: JSON.stringify({
          collateralPoolId: BTC_POOL_ID,
          borrowPoolId: USDT_POOL_ID,
          collateralAsset: "BTC",
          borrowAsset: "USDT",
          collateralAmount: "10000000",
          borrowAmount: "5726000000",
          ltvMaxBps: "6000",
          depositWindowSeconds: "3600",
          borrowDestination: {
            External: CHECKSUM_EVM_BORROW_ADDRESS,
          },
          refundDestination: { External: VALID_BTC_REFUND_ADDRESS },
        }),
        method: "POST",
      })
    );
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(getLoan).toHaveBeenCalledWith(LOAN_ID);
    expect(loan.loanId).toBe(LOAN_ID);
    expect(loan.status).toEqual({
      operation: "deposit",
      state: "action_required",
      confirmations: null,
      requiredConfirmations: null,
    });
    expect(loan.collateral.amount).toBe(10_000_000n);
    expect(loan.terms).toEqual({
      ltvMaxBps: 6_800n,
      depositWindowSeconds: 3_600n,
    });
    expect(loan.repayment).toMatchObject({
      amount: 0n,
      debtAmount: 0n,
      interestBufferAmount: 0n,
      inflowFeeAmount: 0n,
      inflowFeeEstimateAvailable: false,
      asset: "USDT",
      chain: "ETH",
    });
    expect(loan.initialDeposit).toMatchObject({
      amount: EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS,
      decimals: 8n,
      collateralAmount: 10_000_000n,
      inflowFeeAmount: 2_500n,
      asset: "BTC",
      chain: "BTC",
      detectedTimestamp: null,
      expiryTimestamp: EXPIRY_TIMESTAMP_SECONDS,
      target: expect.objectContaining({
        address: "bc1qinstantdeposit",
      }),
    });
  });

  test("creates a loan with an ICP borrow destination and ck initial deposit target", async () => {
    // given
    const CKBTC_LEDGER_FEE_SATS = 10n;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input, init) => {
        const url = input.toString();
        if (init?.method === "POST") {
          return new Response(
            JSON.stringify({
              success: true,
              loan: {
                loanId: LOAN_ID.toString(),
                collateral: {
                  amountHint: "10000000",
                },
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        if (url.includes("/activities?")) {
          return new Response(JSON.stringify({ activities: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(JSON.stringify({ error: "not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        });
      });

    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([createBtcPoolRecord(), createIcpPoolRecord()]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never)
      .mockReturnValueOnce({
        get_loan: vi.fn().mockResolvedValue({
          Ok: createInstantLoan({
            borrow_destination: { Native: Principal.fromText(PROFILE_ID) },
            borrow_amount: 1_000_000n,
            borrow_pool_id: Principal.fromText(ICP_POOL_ID),
            borrow_asset: { ICP: null },
          }),
        }),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({
        get_position: vi.fn().mockResolvedValue([]),
      } as never)
      .mockReturnValueOnce({
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        icrc1_fee: vi.fn().mockResolvedValue(CKBTC_LEDGER_FEE_SATS),
      } as never);
    const client = new LiquidiumClient({
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: ICP_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "ICP",
      collateralAmount: 10_000_000n,
      borrowAmount: 1_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      initialDepositChain: "ICP",
      borrowChain: "ICP",
      borrowDestination: PROFILE_ID,
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    const EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS = 10_000_000n + 10n;

    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v1/instant-loans`,
      expect.objectContaining({
        body: JSON.stringify({
          collateralPoolId: BTC_POOL_ID,
          borrowPoolId: ICP_POOL_ID,
          collateralAsset: "BTC",
          borrowAsset: "ICP",
          collateralAmount: "10000000",
          borrowAmount: "1000000",
          ltvMaxBps: "6000",
          depositWindowSeconds: "3600",
          borrowDestination: { Native: PROFILE_ID },
          refundDestination: { External: VALID_BTC_REFUND_ADDRESS },
        }),
        method: "POST",
      })
    );
    expect(loan.borrow).toMatchObject({
      asset: "ICP",
      destination: {
        type: "IcPrincipal",
        principal: PROFILE_ID,
      },
    });
    expect(loan.initialDeposit).toMatchObject({
      amount: EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS,
      inflowFeeAmount: CKBTC_LEDGER_FEE_SATS,
      target: expect.objectContaining({
        type: "IcrcAccount",
        asset: "BTC",
        chain: "ICP",
      }),
    });
  });

  test("rejects an invalid ICP borrow destination before creating the loan", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: ICP_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "ICP",
      collateralAmount: 10_000_000n,
      borrowAmount: 1_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ICP",
      borrowDestination: "not-an-icp-destination",
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects an invalid ck borrow principal before creating the loan", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ICP",
      borrowDestination: "not-an-ic-principal",
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "ICP instant loan borrow destination must be an IC principal or ICRC account",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects a ck borrow destination that uses an external account before creating the loan", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ICP",
      borrowDestination: {
        type: "ChainAddress",
        address: CHECKSUM_EVM_BORROW_ADDRESS,
      },
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "ICP instant loan borrow destination must be an IC principal or ICRC account",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects a native borrow destination that uses an IC principal before creating the loan", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: {
        type: "IcPrincipal",
        address: PROFILE_ID,
      },
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "ETH instant loan borrow destination must be an external chain address for USDT",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects an unsupported typed ck borrow destination before creating the loan", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "SOL",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ICP",
      borrowDestination: {
        type: "IcPrincipal",
        address: PROFILE_ID,
      },
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "ICP instant loan borrow delivery is not supported for SOL",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test.each<InstantLoanDestinationValidationCase>([
    {
      name: "ck stablecoin borrow rejects an ETH L1 address",
      requestOverrides: {
        borrowChain: "ICP",
        borrowDestination: {
          type: "ChainAddress",
          address: CHECKSUM_EVM_BORROW_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan borrow destination must be an IC principal or ICRC account",
    },
    {
      name: "ck stablecoin borrow rejects a BTC L1 address",
      requestOverrides: {
        borrowChain: "ICP",
        borrowDestination: {
          type: "ChainAddress",
          address: VALID_BTC_REFUND_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan borrow destination must be an IC principal or ICRC account",
    },
    {
      name: "ck stablecoin borrow rejects an ICP account identifier",
      requestOverrides: {
        borrowChain: "ICP",
        borrowDestination: {
          type: "IcpAccountIdentifier",
          address: ACCOUNT_IDENTIFIER,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan borrow destination must be an IC principal or ICRC account",
    },
    {
      name: "ckBTC refund rejects a BTC L1 address",
      requestOverrides: {
        refundChain: "ICP",
        refundDestination: {
          type: "ChainAddress",
          address: VALID_BTC_REFUND_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan refund destination must be an IC principal or ICRC account",
    },
    {
      name: "ckBTC refund rejects an ETH L1 address",
      requestOverrides: {
        refundChain: "ICP",
        refundDestination: {
          type: "ChainAddress",
          address: CHECKSUM_EVM_BORROW_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan refund destination must be an IC principal or ICRC account",
    },
    {
      name: "ckBTC refund rejects an ICP account identifier",
      requestOverrides: {
        refundChain: "ICP",
        refundDestination: {
          type: "IcpAccountIdentifier",
          address: ACCOUNT_IDENTIFIER,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan refund destination must be an IC principal or ICRC account",
    },
    {
      name: "native stablecoin borrow rejects an IC principal",
      requestOverrides: {
        borrowDestination: {
          type: "IcPrincipal",
          address: PROFILE_ID,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ETH instant loan borrow destination must be an external chain address for USDT",
    },
    {
      name: "native stablecoin borrow rejects an ICRC account",
      requestOverrides: {
        borrowDestination: {
          type: "IcrcAccount",
          address: VALID_ICRC_DESTINATION,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "USDT instant loan borrow destination only supports ChainAddress or IcPrincipal destinations",
    },
    {
      name: "native BTC refund rejects an IC principal",
      requestOverrides: {
        refundDestination: {
          type: "IcPrincipal",
          address: PROFILE_ID,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "BTC instant loan refund destination must be an external chain address for BTC",
    },
    {
      name: "native BTC refund rejects an ICRC account",
      requestOverrides: {
        refundDestination: {
          type: "IcrcAccount",
          address: VALID_ICRC_DESTINATION,
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "BTC instant loan refund destination only supports ChainAddress or IcPrincipal destinations",
    },
    {
      name: "native ICP borrow rejects an ETH L1 address",
      requestOverrides: {
        borrowPoolId: ICP_POOL_ID,
        borrowAsset: "ICP",
        borrowAmount: DEFAULT_ICP_AMOUNT_E8S,
        borrowDestination: {
          type: "ChainAddress",
          address: CHECKSUM_EVM_BORROW_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP borrow rejects a BTC L1 address",
      requestOverrides: {
        borrowPoolId: ICP_POOL_ID,
        borrowAsset: "ICP",
        borrowAmount: DEFAULT_ICP_AMOUNT_E8S,
        borrowDestination: {
          type: "ChainAddress",
          address: VALID_BTC_REFUND_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP borrow rejects an ETH string shorthand address",
      requestOverrides: {
        borrowPoolId: ICP_POOL_ID,
        borrowAsset: "ICP",
        borrowAmount: DEFAULT_ICP_AMOUNT_E8S,
        borrowDestination: CHECKSUM_EVM_BORROW_ADDRESS,
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP borrow rejects a string shorthand address without a chain",
      requestOverrides: {
        borrowPoolId: ICP_POOL_ID,
        borrowAsset: "ICP",
        borrowAmount: DEFAULT_ICP_AMOUNT_E8S,
        borrowChain:
          undefined as unknown as CreateInstantLoanRequest["borrowChain"],
        borrowDestination: CHECKSUM_EVM_BORROW_ADDRESS,
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP refund rejects an ETH L1 address",
      requestOverrides: {
        collateralPoolId: ICP_POOL_ID,
        collateralAsset: "ICP",
        collateralAmount: DEFAULT_ICP_AMOUNT_E8S,
        refundDestination: {
          type: "ChainAddress",
          address: CHECKSUM_EVM_BORROW_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP refund rejects a BTC L1 address",
      requestOverrides: {
        collateralPoolId: ICP_POOL_ID,
        collateralAsset: "ICP",
        collateralAmount: DEFAULT_ICP_AMOUNT_E8S,
        refundDestination: {
          type: "ChainAddress",
          address: VALID_BTC_REFUND_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP refund rejects a BTC string shorthand address",
      requestOverrides: {
        collateralPoolId: ICP_POOL_ID,
        collateralAsset: "ICP",
        collateralAmount: DEFAULT_ICP_AMOUNT_E8S,
        refundDestination: VALID_BTC_REFUND_ADDRESS,
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
  ])("rejects unsafe instant loan destination combo: $name", async ({
    requestOverrides,
    expectedCode,
    expectedMessage,
  }) => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create(
      createInstantLoanRequest(requestOverrides)
    );

    // then
    await expect(result).rejects.toMatchObject({
      code: expectedCode,
      message: expectedMessage,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects an instant loan with a borrow amount below the asset minimum", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([createBtcPoolRecord(), createUsdtPoolRecord()]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never);
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 999_999n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: CHECKSUM_EVM_BORROW_ADDRESS,
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Borrow amount must be at least 1000000 base units for USDT",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects an instant loan with an invalid BTC refund destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: CHECKSUM_EVM_BORROW_ADDRESS,
      refundChain: "BTC",
      refundDestination: "bc1qrefunddestination",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid mainnet BTC address",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects an instant loan with an invalid EVM borrow destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: "not-an-evm-address",
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid EVM address",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects an instant loan with an invalid BTC borrow destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: USDT_POOL_ID,
      borrowPoolId: BTC_POOL_ID,
      collateralAsset: "USDT",
      borrowAsset: "BTC",
      collateralAmount: 5_726_000_000n,
      borrowAmount: 10_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: "tb1qnotmainnet",
      refundChain: "BTC",
      refundDestination: CHECKSUM_EVM_BORROW_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid mainnet BTC address",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects an instant loan with an invalid EVM refund destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create({
      collateralPoolId: USDT_POOL_ID,
      borrowPoolId: BTC_POOL_ID,
      collateralAsset: "USDT",
      borrowAsset: "BTC",
      collateralAmount: 5_726_000_000n,
      borrowAmount: 10_000_000n,
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: VALID_BTC_REFUND_ADDRESS,
      refundChain: "BTC",
      refundDestination: "not-an-evm-address",
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ADDRESS,
      message: "Address must be a valid EVM address",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects a loan when current LTV plus slippage exceeds the pool max", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([
            createBtcPoolRecord({ max_ltv: 6_500n }),
            createUsdtPoolRecord(),
          ]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 6_500_000_000n,
      ltvMaxBps: 6_500n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: "0x2222222222222222222222222222222222222222",
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Instant loan max LTV 65.00% is below minimum allowed 67.00% (current implied LTV 65.00% + 2.00% buffer)",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects a loan when max LTV is below the slippage minimum", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([
            createBtcPoolRecord({ max_ltv: 6_500n }),
            createUsdtPoolRecord(),
          ]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 5_726_000_000n,
      ltvMaxBps: 5_925n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: "0x2222222222222222222222222222222222222222",
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Instant loan max LTV 59.25% is below minimum allowed 59.26% (current implied LTV 57.26% + 2.00% buffer)",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects a loan when max LTV exceeds the collateral pool max", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi
          .fn()
          .mockResolvedValue([createBtcPoolRecord(), createUsdtPoolRecord()]),
        get_pool_rate: vi
          .fn()
          .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
      } as never)
      .mockReturnValueOnce({
        get_prices: vi.fn().mockResolvedValue(prices()),
      } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = client.instantLoans.create({
      collateralPoolId: BTC_POOL_ID,
      borrowPoolId: USDT_POOL_ID,
      collateralAsset: "BTC",
      borrowAsset: "USDT",
      collateralAmount: 10_000_000n,
      borrowAmount: 2_000_000n,
      ltvMaxBps: 7_001n,
      depositWindowSeconds: 3_600n,
      borrowChain: "ETH",
      borrowDestination: "0x2222222222222222222222222222222222222222",
      refundChain: "BTC",
      refundDestination: VALID_BTC_REFUND_ADDRESS,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.MAX_LTV_EXCEEDED,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

function createInstantLoanRequest(
  overrides: Partial<CreateInstantLoanRequest> = {}
): CreateInstantLoanRequest {
  return {
    collateralPoolId: BTC_POOL_ID,
    borrowPoolId: USDT_POOL_ID,
    collateralAsset: "BTC",
    borrowAsset: "USDT",
    collateralAmount: DEFAULT_COLLATERAL_AMOUNT_BASE_UNITS,
    borrowAmount: DEFAULT_BORROW_AMOUNT_BASE_UNITS,
    ltvMaxBps: DEFAULT_LTV_MAX_BPS,
    depositWindowSeconds: DEFAULT_DEPOSIT_WINDOW_SECONDS,
    borrowChain: "ETH",
    borrowDestination: CHECKSUM_EVM_BORROW_ADDRESS,
    refundChain: "BTC",
    refundDestination: VALID_BTC_REFUND_ADDRESS,
    ...overrides,
  };
}
