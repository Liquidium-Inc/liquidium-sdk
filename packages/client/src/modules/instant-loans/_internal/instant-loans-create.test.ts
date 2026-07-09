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
  CANISTER_EVM_BORROW_ADDRESS,
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
  requestOverrides: CreateInstantLoanRequestOverrides;
  expectedCode: LiquidiumErrorCode;
  expectedMessage: string;
}

type CreateInstantLoanRequestOverrides = Partial<
  Omit<CreateInstantLoanRequest, "borrow" | "collateral" | "refund">
> & {
  borrow?: Partial<CreateInstantLoanRequest["borrow"]>;
  collateral?: Partial<CreateInstantLoanRequest["collateral"]>;
  refund?: Partial<CreateInstantLoanRequest["refund"]>;
};

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

    mockInstantLoanCreateHydrationActors({
      getLoan,
      btcMinterDepositFee: BTC_MINTER_DEPOSIT_FEE_SATS,
      icrc1Fee: CKBTC_LEDGER_FEE_SATS,
    });
    const client = new LiquidiumClient({
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.instantLoans.create({
      collateral: {
        poolId: BTC_POOL_ID,
        asset: "BTC",
        amount: 10_000_000n,
      },
      borrow: {
        poolId: USDT_POOL_ID,
        asset: "USDT",
        amount: 5_726_000_000n,
        chain: "ETH",
        destination: {
          type: "ChainAddress",
          address: LOWERCASE_EVM_BORROW_ADDRESS,
        },
      },
      refund: {
        chain: "BTC",
        destination: VALID_BTC_REFUND_ADDRESS,
      },
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
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
      debtAmount: 0n,
      interestBufferAmount: 0n,
      asset: "USDT",
      targets: {
        poolChain: {
          amount: 0n,
          chain: "ETH",
          inflowFeeAmount: 0n,
          inflowFeeEstimateAvailable: false,
        },
        icp: {
          amount: 0n,
          chain: "ICP",
          inflowFeeAmount: 0n,
          inflowFeeEstimateAvailable: false,
        },
      },
    });
    expect(loan.borrow).toMatchObject({
      asset: "USDT",
      chain: "ETH",
      destination: {
        type: "ChainAddress",
        address: CANISTER_EVM_BORROW_ADDRESS,
      },
    });
    expect(loan.initialDeposit).toMatchObject({
      decimals: 8n,
      collateralAmount: 10_000_000n,
      asset: "BTC",
      detectedTimestamp: null,
      expiryTimestamp: EXPIRY_TIMESTAMP_SECONDS,
      targets: {
        poolChain: {
          amount: EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS,
          chain: "BTC",
          inflowFeeAmount: 2_500n,
          target: expect.objectContaining({
            address: "bc1qinstantdeposit",
          }),
        },
        icp: {
          amount: 10_000_000n + CKBTC_LEDGER_FEE_SATS,
          chain: "ICP",
          inflowFeeAmount: CKBTC_LEDGER_FEE_SATS,
          target: expect.objectContaining({
            type: "IcrcAccount",
            asset: "BTC",
            chain: "ICP",
          }),
        },
      },
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

    mockInstantLoanCreateHydrationActors({
      getLoan: vi.fn().mockResolvedValue({
        Ok: createInstantLoan({
          borrow_destination: { Native: Principal.fromText(PROFILE_ID) },
          borrow_amount: 1_000_000n,
          borrow_pool_id: Principal.fromText(ICP_POOL_ID),
          borrow_asset: { ICP: null },
        }),
      }),
      btcMinterDepositFee: 2_000n,
      icrc1Fee: CKBTC_LEDGER_FEE_SATS,
    });
    const client = new LiquidiumClient({
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.instantLoans.create({
      collateral: {
        poolId: BTC_POOL_ID,
        asset: "BTC",
        amount: 10_000_000n,
      },
      borrow: {
        poolId: ICP_POOL_ID,
        asset: "ICP",
        amount: 1_000_000n,
        chain: "ICP",
        destination: PROFILE_ID,
      },
      refund: {
        chain: "BTC",
        destination: VALID_BTC_REFUND_ADDRESS,
      },
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
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
      targets: {
        icp: {
          amount: EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS,
          inflowFeeAmount: CKBTC_LEDGER_FEE_SATS,
          target: expect.objectContaining({
            type: "IcrcAccount",
            asset: "BTC",
            chain: "ICP",
          }),
        },
      },
    });
  });

  test("rejects an invalid ICP borrow destination before creating the loan", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: 1_000_000n,
          chain: "ICP",
          destination: "not-an-icp-destination",
        },
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          chain: "ICP",
          destination: "not-an-ic-principal",
        },
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          chain: "ICP",
          destination: {
            type: "ChainAddress",
            address: CHECKSUM_EVM_BORROW_ADDRESS,
          },
        },
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          destination: {
            type: "IcPrincipal",
            address: PROFILE_ID,
          },
        },
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          asset: "SOL",
          chain: "ICP",
          destination: {
            type: "IcPrincipal",
            address: PROFILE_ID,
          },
        },
      })
    );

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
      name: "native BTC borrow rejects ETH delivery chain",
      requestOverrides: {
        borrow: {
          poolId: BTC_POOL_ID,
          asset: "BTC",
          amount: DEFAULT_COLLATERAL_AMOUNT_BASE_UNITS,
          chain: "ETH",
          destination: {
            type: "ChainAddress",
            address: VALID_BTC_REFUND_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage: "Address chain must match asset",
    },
    {
      name: "native stablecoin borrow rejects BTC delivery chain",
      requestOverrides: {
        borrow: {
          chain: "BTC",
          destination: {
            type: "ChainAddress",
            address: CHECKSUM_EVM_BORROW_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage: "Address chain must match asset",
    },
    {
      name: "native BTC refund rejects ETH delivery chain",
      requestOverrides: {
        refund: {
          chain: "ETH",
          destination: {
            type: "ChainAddress",
            address: VALID_BTC_REFUND_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage: "Address chain must match asset",
    },
    {
      name: "ck stablecoin borrow rejects an ETH L1 address",
      requestOverrides: {
        borrow: {
          chain: "ICP",
          destination: {
            type: "ChainAddress",
            address: CHECKSUM_EVM_BORROW_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan borrow destination must be an IC principal or ICRC account",
    },
    {
      name: "ck stablecoin borrow rejects a BTC L1 address",
      requestOverrides: {
        borrow: {
          chain: "ICP",
          destination: {
            type: "ChainAddress",
            address: VALID_BTC_REFUND_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan borrow destination must be an IC principal or ICRC account",
    },
    {
      name: "ck stablecoin borrow rejects an ICP account identifier",
      requestOverrides: {
        borrow: {
          chain: "ICP",
          destination: {
            type: "IcpAccountIdentifier",
            address: ACCOUNT_IDENTIFIER,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan borrow destination must be an IC principal or ICRC account",
    },
    {
      name: "ckBTC refund rejects a BTC L1 address",
      requestOverrides: {
        refund: {
          chain: "ICP",
          destination: {
            type: "ChainAddress",
            address: VALID_BTC_REFUND_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan refund destination must be an IC principal or ICRC account",
    },
    {
      name: "ckBTC refund rejects an ETH L1 address",
      requestOverrides: {
        refund: {
          chain: "ICP",
          destination: {
            type: "ChainAddress",
            address: CHECKSUM_EVM_BORROW_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan refund destination must be an IC principal or ICRC account",
    },
    {
      name: "ckBTC refund rejects an ICP account identifier",
      requestOverrides: {
        refund: {
          chain: "ICP",
          destination: {
            type: "IcpAccountIdentifier",
            address: ACCOUNT_IDENTIFIER,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP instant loan refund destination must be an IC principal or ICRC account",
    },
    {
      name: "native stablecoin borrow rejects an IC principal",
      requestOverrides: {
        borrow: {
          destination: {
            type: "IcPrincipal",
            address: PROFILE_ID,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ETH instant loan borrow destination must be an external chain address for USDT",
    },
    {
      name: "native stablecoin borrow rejects an ICRC account",
      requestOverrides: {
        borrow: {
          destination: {
            type: "IcrcAccount",
            address: VALID_ICRC_DESTINATION,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "USDT instant loan borrow destination only supports ChainAddress or IcPrincipal destinations",
    },
    {
      name: "native BTC refund rejects an IC principal",
      requestOverrides: {
        refund: {
          destination: {
            type: "IcPrincipal",
            address: PROFILE_ID,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "BTC instant loan refund destination must be an external chain address for BTC",
    },
    {
      name: "native BTC refund rejects an ICRC account",
      requestOverrides: {
        refund: {
          destination: {
            type: "IcrcAccount",
            address: VALID_ICRC_DESTINATION,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "BTC instant loan refund destination only supports ChainAddress or IcPrincipal destinations",
    },
    {
      name: "native ICP borrow rejects an ETH L1 address",
      requestOverrides: {
        borrow: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
          destination: {
            type: "ChainAddress",
            address: CHECKSUM_EVM_BORROW_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP borrow rejects a BTC L1 address",
      requestOverrides: {
        borrow: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
          destination: {
            type: "ChainAddress",
            address: VALID_BTC_REFUND_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP borrow rejects an ETH string shorthand address",
      requestOverrides: {
        borrow: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
          destination: CHECKSUM_EVM_BORROW_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP borrow rejects a string shorthand address without a chain",
      requestOverrides: {
        borrow: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
          chain:
            undefined as unknown as CreateInstantLoanRequest["borrow"]["chain"],
          destination: CHECKSUM_EVM_BORROW_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP refund rejects an ETH L1 address",
      requestOverrides: {
        collateral: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
        },
        refund: {
          destination: {
            type: "ChainAddress",
            address: CHECKSUM_EVM_BORROW_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP refund rejects a BTC L1 address",
      requestOverrides: {
        collateral: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
        },
        refund: {
          destination: {
            type: "ChainAddress",
            address: VALID_BTC_REFUND_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP refund rejects a BTC string shorthand address",
      requestOverrides: {
        collateral: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
        },
        refund: {
          destination: VALID_BTC_REFUND_ADDRESS,
        },
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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          amount: 999_999n,
        },
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        refund: {
          destination: "bc1qrefunddestination",
        },
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          destination: "not-an-evm-address",
        },
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        collateral: {
          poolId: USDT_POOL_ID,
          asset: "USDT",
          amount: 5_726_000_000n,
        },
        borrow: {
          poolId: BTC_POOL_ID,
          asset: "BTC",
          amount: 10_000_000n,
          chain: "BTC",
          destination: "tb1qnotmainnet",
        },
        refund: {
          chain: "ETH",
          destination: CHECKSUM_EVM_BORROW_ADDRESS,
        },
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        collateral: {
          poolId: USDT_POOL_ID,
          asset: "USDT",
          amount: 5_726_000_000n,
        },
        borrow: {
          poolId: BTC_POOL_ID,
          asset: "BTC",
          amount: 10_000_000n,
          chain: "BTC",
          destination: VALID_BTC_REFUND_ADDRESS,
        },
        refund: {
          chain: "ETH",
          destination: "not-an-evm-address",
        },
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          amount: 6_500_000_000n,
          destination: "0x2222222222222222222222222222222222222222",
        },
        ltvMaxBps: 6_500n,
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          destination: "0x2222222222222222222222222222222222222222",
        },
        ltvMaxBps: 5_925n,
      })
    );

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
    const result = client.instantLoans.create(
      createInstantLoanRequest({
        borrow: {
          amount: 2_000_000n,
          destination: "0x2222222222222222222222222222222222222222",
        },
        ltvMaxBps: 7_001n,
      })
    );

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.MAX_LTV_EXCEEDED,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

function createInstantLoanRequest(
  overrides: CreateInstantLoanRequestOverrides = {}
): CreateInstantLoanRequest {
  const request: CreateInstantLoanRequest = {
    collateral: {
      poolId: BTC_POOL_ID,
      asset: "BTC",
      amount: DEFAULT_COLLATERAL_AMOUNT_BASE_UNITS,
    },
    borrow: {
      poolId: USDT_POOL_ID,
      asset: "USDT",
      amount: DEFAULT_BORROW_AMOUNT_BASE_UNITS,
      chain: "ETH",
      destination: CHECKSUM_EVM_BORROW_ADDRESS,
    },
    refund: {
      chain: "BTC",
      destination: VALID_BTC_REFUND_ADDRESS,
    },
    ltvMaxBps: DEFAULT_LTV_MAX_BPS,
    depositWindowSeconds: DEFAULT_DEPOSIT_WINDOW_SECONDS,
  };

  return {
    ...request,
    ...overrides,
    collateral: {
      ...request.collateral,
      ...overrides.collateral,
    },
    borrow: {
      ...request.borrow,
      ...overrides.borrow,
    },
    refund: {
      ...request.refund,
      ...overrides.refund,
    },
  };
}

function mockInstantLoanCreateHydrationActors(params: {
  getLoan: ReturnType<typeof vi.fn>;
  btcMinterDepositFee: bigint;
  icrc1Fee: bigint;
}): void {
  vi.spyOn(Actor, "createActor").mockReturnValue({
    list_pools: vi
      .fn()
      .mockResolvedValue([
        createBtcPoolRecord({ max_ltv: 6_500n }),
        createUsdtPoolRecord(),
        createIcpPoolRecord(),
      ]),
    get_prices: vi.fn().mockResolvedValue(prices()),
    get_loan: params.getLoan,
    get_position: vi.fn().mockResolvedValue([]),
    get_pool_rate: vi
      .fn()
      .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]),
    get_btc_address: vi.fn().mockResolvedValue("bc1qinstantdeposit"),
    get_deposit_address: vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    }),
    estimate_deposit_fee: vi.fn().mockResolvedValue({ Ok: 1_500_000n }),
    get_deposit_fee: vi.fn().mockResolvedValue(params.btcMinterDepositFee),
    icrc1_fee: vi.fn().mockResolvedValue(params.icrc1Fee),
  } as never);
}
