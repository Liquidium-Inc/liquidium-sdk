import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { encodeIcpAccountIdentifier } from "../../../core/accounts";
import { DEFAULT_API_BASE_URL } from "../../../core/config";
import {
  type CreateSimpleLoanRequest,
  LiquidiumClient,
  LiquidiumErrorCode,
  publicIdFromInt,
  SimpleLoanCreatedError,
} from "../../../index";
import {
  ACCOUNT_IDENTIFIER,
  BTC_POOL_ID,
  CANISTER_EVM_BORROW_ADDRESS,
  CHECKSUM_EVM_BORROW_ADDRESS,
  createBtcPoolRecord,
  createEthPoolRecord,
  createIcpPoolRecord,
  createSimpleLoan,
  createUsdtPoolRecord,
  ETH_POOL_ID,
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
const VALID_ACCOUNT_IDENTIFIER = encodeIcpAccountIdentifier({
  owner: Principal.fromText(PROFILE_ID),
});
const DEFAULT_COLLATERAL_AMOUNT_BASE_UNITS = 10_000_000n;
const DEFAULT_BORROW_AMOUNT_BASE_UNITS = 5_726_000_000n;
const DEFAULT_ICP_AMOUNT_E8S = 1_000_000n;
const DEFAULT_LTV_MAX_BPS = 6_000n;
const DEFAULT_DEPOSIT_WINDOW_SECONDS = 3_600n;

interface SimpleLoanDestinationValidationCase {
  name: string;
  requestOverrides: CreateSimpleLoanRequestOverrides;
  expectedCode: LiquidiumErrorCode;
  expectedMessage: string;
}

type CreateSimpleLoanRequestOverrides = Partial<
  Omit<CreateSimpleLoanRequest, "borrow" | "collateral" | "refund">
> & {
  borrow?: {
    poolId?: string;
    asset?: string;
    amount?: bigint;
    chain?: string;
    destination?: CreateSimpleLoanRequest["borrow"]["destination"];
  };
  collateral?: {
    poolId?: string;
    asset?: string;
    amount?: bigint;
  };
  refund?: {
    chain?: string;
    destination?: CreateSimpleLoanRequest["refund"]["destination"];
  };
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("SimpleLoansModule create", () => {
  test("creates a loan with ETH collateral at the 0.005 ETH minimum", async () => {
    // given
    const MINIMUM_ETH_AMOUNT_WEI = 5_000_000_000_000_000n;
    const MINIMUM_USDT_BORROW_AMOUNT_BASE_UNITS = 1_000_000n;
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input, init) => {
        if (init?.method === "POST") {
          return new Response(
            JSON.stringify({
              success: true,
              loan: {
                loanId: LOAN_ID.toString(),
                collateral: { amountHint: MINIMUM_ETH_AMOUNT_WEI.toString() },
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        if (input.toString().includes("/activities?")) {
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
    mockSimpleLoanCreateHydrationActors({
      getLoan: vi.fn().mockResolvedValue({
        Ok: createSimpleLoan({
          lend_asset: { ETH: null },
          lend_pool_id: Principal.fromText(ETH_POOL_ID),
          refund_destination: { External: CANISTER_EVM_BORROW_ADDRESS },
        }),
      }),
      btcMinterDepositFee: 2_000n,
      icrc1Fee: 2_000_000_000_000n,
    });
    const client = new LiquidiumClient({});

    // when
    const loan = await client.simpleLoans.create(
      createSimpleLoanRequest({
        collateral: {
          poolId: ETH_POOL_ID,
          asset: "ETH",
          amount: MINIMUM_ETH_AMOUNT_WEI,
        },
        borrow: {
          amount: MINIMUM_USDT_BORROW_AMOUNT_BASE_UNITS,
        },
        refund: {
          chain: "ETH",
          destination: LOWERCASE_EVM_BORROW_ADDRESS,
        },
      })
    );

    // then
    const post = fetchSpy.mock.calls.find(
      ([, init]) => init?.method === "POST"
    );
    expect(JSON.parse(post?.[1]?.body as string)).toMatchObject({
      collateralPoolId: ETH_POOL_ID,
      collateralAsset: "ETH",
      collateralAmount: MINIMUM_ETH_AMOUNT_WEI.toString(),
      refundDestination: { External: CHECKSUM_EVM_BORROW_ADDRESS },
    });
    expect(loan.collateral).toMatchObject({
      asset: "ETH",
      decimals: 18n,
      amount: MINIMUM_ETH_AMOUNT_WEI,
    });
  });

  test("rejects an invalid native ETH destination before creating the loan", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
        borrow: {
          poolId: ETH_POOL_ID,
          asset: "ETH",
          amount: 5_000_000_000_000_000n,
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

  test("creates a loan through the default SDK API and hydrates canonical canister state", async () => {
    // given
    const BTC_MINTER_DEPOSIT_FEE_SATS = 2_000n;
    const CKBTC_LEDGER_FEE_SATS = 10n;
    const EXPIRY_TIMESTAMP_SECONDS = 1_775_235_600n;
    const getLoan = vi.fn().mockResolvedValue({
      Ok: createSimpleLoan({ expires_at: [EXPIRY_TIMESTAMP_SECONDS] }),
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

    mockSimpleLoanCreateHydrationActors({
      getLoan,
      btcMinterDepositFee: BTC_MINTER_DEPOSIT_FEE_SATS,
      icrc1Fee: CKBTC_LEDGER_FEE_SATS,
    });
    const client = new LiquidiumClient({
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.create({
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
        ETH: {
          amount: 0n,
          inflowFeeAmount: 0n,
          inflowFeeEstimateAvailable: false,
        },
        ICP: {
          amount: 0n,
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
        BTC: {
          amount: EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS,
          inflowFeeAmount: 2_500n,
          target: expect.objectContaining({
            address: "bc1qinstantdeposit",
          }),
        },
        ICP: {
          amount: 10_000_000n + CKBTC_LEDGER_FEE_SATS,
          inflowFeeAmount: CKBTC_LEDGER_FEE_SATS,
          target: expect.objectContaining({
            asset: "BTC",
            chain: "ICP",
          }),
        },
      },
    });
  });

  test("creates a ckUSDT loan with a principal destination", async () => {
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

    mockSimpleLoanCreateHydrationActors({
      getLoan: vi.fn().mockResolvedValue({
        Ok: createSimpleLoan({
          borrow_destination: { Native: Principal.fromText(PROFILE_ID) },
        }),
      }),
      btcMinterDepositFee: 2_000n,
      icrc1Fee: CKBTC_LEDGER_FEE_SATS,
    });
    const client = new LiquidiumClient({
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.create({
      collateral: {
        poolId: BTC_POOL_ID,
        asset: "BTC",
        amount: 10_000_000n,
      },
      borrow: {
        poolId: USDT_POOL_ID,
        asset: "USDT",
        amount: DEFAULT_BORROW_AMOUNT_BASE_UNITS,
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
          borrowPoolId: USDT_POOL_ID,
          collateralAsset: "BTC",
          borrowAsset: "USDT",
          collateralAmount: "10000000",
          borrowAmount: DEFAULT_BORROW_AMOUNT_BASE_UNITS.toString(),
          ltvMaxBps: "6000",
          depositWindowSeconds: "3600",
          borrowDestination: { Native: PROFILE_ID },
          refundDestination: { External: VALID_BTC_REFUND_ADDRESS },
        }),
        method: "POST",
      })
    );
    expect(loan.borrow).toMatchObject({
      asset: "USDT",
      destination: {
        type: "IcPrincipal",
        address: PROFILE_ID,
      },
    });
    expect(loan.initialDeposit).toMatchObject({
      targets: {
        ICP: {
          amount: EXPECTED_INITIAL_DEPOSIT_AMOUNT_SATS,
          inflowFeeAmount: CKBTC_LEDGER_FEE_SATS,
          target: expect.objectContaining({
            asset: "BTC",
            chain: "ICP",
          }),
        },
      },
    });
  });

  test.each([
    {
      name: "principal",
      destination: PROFILE_ID,
      wireDestination: { Native: PROFILE_ID },
      canisterDestination: { Native: Principal.fromText(PROFILE_ID) },
    },
    {
      name: "account identifier",
      destination: {
        type: "IcpAccountIdentifier" as const,
        address: VALID_ACCOUNT_IDENTIFIER,
      },
      wireDestination: { AccountIdentifier: VALID_ACCOUNT_IDENTIFIER },
      canisterDestination: { AccountIdentifier: VALID_ACCOUNT_IDENTIFIER },
    },
    {
      name: "ICRC account",
      destination: {
        type: "IcrcAccount" as const,
        address: VALID_ICRC_DESTINATION,
      },
      wireDestination: { Icrc: VALID_ICRC_DESTINATION },
      canisterDestination: {
        Icrc: {
          owner: Principal.fromText(PROFILE_ID),
          subaccount: [ICRC_SUBACCOUNT],
        },
      },
    },
  ])("creates a native ICP loan with a $name destination", async ({
    destination,
    wireDestination,
    canisterDestination,
  }) => {
    // given
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input, init) => {
        if (init?.method === "POST") {
          return new Response(
            JSON.stringify({
              success: true,
              loan: {
                loanId: LOAN_ID.toString(),
                collateral: { amountHint: "10000000" },
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }

        if (input.toString().includes("/activities?")) {
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
    mockSimpleLoanCreateHydrationActors({
      getLoan: vi.fn().mockResolvedValue({
        Ok: createSimpleLoan({
          borrow_destination: canisterDestination as never,
          borrow_amount: DEFAULT_ICP_AMOUNT_E8S,
          borrow_pool_id: Principal.fromText(ICP_POOL_ID),
          borrow_asset: { ICP: null },
        }),
      }),
      btcMinterDepositFee: 2_000n,
      icrc1Fee: 10n,
    });
    const client = new LiquidiumClient({
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const loan = await client.simpleLoans.create(
      createSimpleLoanRequest({
        borrow: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
          chain: "ICP",
          destination,
        },
      })
    );

    // then
    const post = fetchSpy.mock.calls.find(
      ([, init]) => init?.method === "POST"
    );
    expect(post).toBeDefined();
    expect(JSON.parse(post?.[1]?.body as string).borrowDestination).toEqual(
      wireDestination
    );
    expect(loan.borrow).toMatchObject({
      asset: "ICP",
      chain: "ICP",
      destination: { address: expect.any(String) },
    });
  });

  test("returns the created loan id when a second hydration fee lookup fails", async () => {
    // given
    const hydrationFailure = new Error("ICP ledger fee unavailable");
    const icrc1Fee = vi
      .fn()
      .mockResolvedValueOnce(10n)
      .mockRejectedValueOnce(hydrationFailure);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input, init) => {
        if (init?.method === "POST") {
          return new Response(
            JSON.stringify({
              success: true,
              loan: {
                loanId: LOAN_ID.toString(),
                collateral: { amountHint: "10000000" },
              },
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }

        if (input.toString().includes("/activities?")) {
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
    mockSimpleLoanCreateHydrationActors({
      getLoan: vi.fn().mockResolvedValue({ Ok: createSimpleLoan() }),
      btcMinterDepositFee: 2_000n,
      icrc1Fee: 10n,
      icrc1FeeMock: icrc1Fee,
    });
    const client = new LiquidiumClient({
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const error = await client.simpleLoans
      .create(createSimpleLoanRequest())
      .catch((cause: unknown) => cause);

    // then
    expect(error).toBeInstanceOf(SimpleLoanCreatedError);
    expect(error).toMatchObject({
      code: "SIMPLE_LOAN_HYDRATION_FAILED",
      loanId: LOAN_ID,
      ref: publicIdFromInt(LOAN_ID),
      cause: hydrationFailure,
    });
    expect(icrc1Fee).toHaveBeenCalledTimes(2);
    expect(
      fetchSpy.mock.calls.filter(([, init]) => init?.method === "POST")
    ).toHaveLength(1);
  });

  test("rejects an invalid ICP borrow destination before creating the loan", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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
        "ICP simple loan destination must be an IC principal, ICP account identifier, or ICRC account",
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
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
        borrow: {
          chain: "ICP",
          destination: "not-an-ic-principal",
        },
      })
    );

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "ICP simple loan borrow destination must be an IC principal",
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
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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
      message: "ICP simple loan borrow destination must be an IC principal",
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
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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
        "ETH simple loan borrow destination must be an external chain address for USDT",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test.each([
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
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ETH simple loan borrow delivery is not supported for BTC",
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
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "BTC simple loan borrow delivery is not supported for USDT",
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
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ETH simple loan refund delivery is not supported for BTC",
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
        "ICP simple loan borrow destination must be an IC principal",
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
        "ICP simple loan borrow destination must be an IC principal",
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
        "ICP simple loan borrow destination must be an IC principal",
    },
    {
      name: "ck stablecoin borrow rejects an ICRC account",
      requestOverrides: {
        borrow: {
          chain: "ICP",
          destination: {
            type: "IcrcAccount",
            address: VALID_ICRC_DESTINATION,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP simple loan borrow destination must be an IC principal",
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
        "ICP simple loan refund destination must be an IC principal",
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
        "ICP simple loan refund destination must be an IC principal",
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
        "ICP simple loan refund destination must be an IC principal",
    },
    {
      name: "ckBTC refund rejects an ICRC account",
      requestOverrides: {
        refund: {
          chain: "ICP",
          destination: {
            type: "IcrcAccount",
            address: VALID_ICRC_DESTINATION,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.VALIDATION_ERROR,
      expectedMessage:
        "ICP simple loan refund destination must be an IC principal",
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
        "ETH simple loan borrow destination must be an external chain address for USDT",
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
        "USDT simple loan borrow destination only supports ChainAddress or IcPrincipal destinations",
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
        "BTC simple loan refund destination must be an external chain address for BTC",
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
        "BTC simple loan refund destination only supports ChainAddress or IcPrincipal destinations",
    },
    {
      name: "native ICP borrow rejects an ETH L1 address",
      requestOverrides: {
        borrow: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
          chain: "ICP",
          destination: {
            type: "ChainAddress",
            address: CHECKSUM_EVM_BORROW_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP simple loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP borrow rejects a BTC L1 address",
      requestOverrides: {
        borrow: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
          chain: "ICP",
          destination: {
            type: "ChainAddress",
            address: VALID_BTC_REFUND_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP simple loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
    {
      name: "native ICP borrow rejects an ETH string shorthand address",
      requestOverrides: {
        borrow: {
          poolId: ICP_POOL_ID,
          asset: "ICP",
          amount: DEFAULT_ICP_AMOUNT_E8S,
          chain: "ICP",
          destination: CHECKSUM_EVM_BORROW_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP simple loan destination must be an IC principal, ICP account identifier, or ICRC account",
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
          chain: "ICP",
          destination: {
            type: "ChainAddress",
            address: CHECKSUM_EVM_BORROW_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP simple loan destination must be an IC principal, ICP account identifier, or ICRC account",
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
          chain: "ICP",
          destination: {
            type: "ChainAddress",
            address: VALID_BTC_REFUND_ADDRESS,
          },
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP simple loan destination must be an IC principal, ICP account identifier, or ICRC account",
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
          chain: "ICP",
          destination: VALID_BTC_REFUND_ADDRESS,
        },
      },
      expectedCode: LiquidiumErrorCode.INVALID_ADDRESS,
      expectedMessage:
        "ICP simple loan destination must be an IC principal, ICP account identifier, or ICRC account",
    },
  ] satisfies SimpleLoanDestinationValidationCase[])("rejects unsafe simple loan destination combo: $name", async ({
    requestOverrides,
    expectedCode,
    expectedMessage,
  }) => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest(requestOverrides)
    );

    // then
    await expect(result).rejects.toMatchObject({
      code: expectedCode,
      message: expectedMessage,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects a simple loan with a borrow amount below the asset minimum", async () => {
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
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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

  test("rejects ETH collateral below the deposit minimum before creation", async () => {
    // given
    const MINIMUM_ETH_COLLATERAL_AMOUNT_WEI = 5_000_000_000_000_000n;
    const ETH_COLLATERAL_AMOUNT_BELOW_MINIMUM_WEI =
      MINIMUM_ETH_COLLATERAL_AMOUNT_WEI - 1n;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
        collateral: {
          poolId: ETH_POOL_ID,
          asset: "ETH",
          amount: ETH_COLLATERAL_AMOUNT_BELOW_MINIMUM_WEI,
        },
        refund: {
          chain: "ETH",
          destination: LOWERCASE_EVM_BORROW_ADDRESS,
        },
      })
    );

    // then
    const EXPECTED_ERROR_MESSAGE =
      "Deposit amount must be at least 5000000000000000 base units for ETH";
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: EXPECTED_ERROR_MESSAGE,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(actorCreateSpy).not.toHaveBeenCalled();
  });

  test("rejects disabled same-asset borrowing at the dust threshold before creation", async () => {
    // given
    const DUST_THRESHOLD_SATS = 10_000n;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          createBtcPoolRecord({
            same_asset_borrowing: [false],
            same_asset_borrowing_dust_threshold: DUST_THRESHOLD_SATS,
          }),
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
    });

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
        collateral: {
          poolId: BTC_POOL_ID,
          asset: "BTC",
          amount: DUST_THRESHOLD_SATS,
        },
        borrow: {
          poolId: BTC_POOL_ID,
          asset: "BTC",
          amount: 5_100n,
          chain: "BTC",
          destination: VALID_BTC_REFUND_ADDRESS,
        },
      })
    );

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: `Same asset borrowing not allowed for pool ${BTC_POOL_ID}`,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects a simple loan asset that does not match its pool", async () => {
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
    });

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
        collateral: {
          asset: "USDT",
        },
        refund: {
          chain: "ETH",
          destination: CHECKSUM_EVM_BORROW_ADDRESS,
        },
      })
    );

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Simple loan collateral asset does not match its pool",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects a simple loan borrow asset that does not match its pool", async () => {
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
    });

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
        borrow: {
          asset: "BTC",
          chain: "BTC",
          destination: VALID_BTC_REFUND_ADDRESS,
        },
      })
    );

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Simple loan borrow asset does not match its pool",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects a simple loan with an invalid BTC refund destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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

  test("rejects a simple loan with an invalid EVM borrow destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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

  test("rejects a simple loan with an invalid BTC borrow destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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

  test("rejects a simple loan with an invalid EVM refund destination", async () => {
    // given
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actorCreateSpy = vi.spyOn(Actor, "createActor");
    const client = new LiquidiumClient({});

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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
        "Simple loan max LTV 65.00% is below minimum allowed 67.00% (current implied LTV 65.00% + 2.00% buffer)",
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
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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
        "Simple loan max LTV 59.25% is below minimum allowed 59.26% (current implied LTV 57.26% + 2.00% buffer)",
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
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const result = client.simpleLoans.create(
      createSimpleLoanRequest({
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

function createSimpleLoanRequest(
  overrides: CreateSimpleLoanRequestOverrides = {}
): CreateSimpleLoanRequest {
  const request: CreateSimpleLoanRequest = {
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
  } as CreateSimpleLoanRequest;
}

function mockSimpleLoanCreateHydrationActors(params: {
  getLoan: ReturnType<typeof vi.fn>;
  btcMinterDepositFee: bigint;
  icrc1Fee: bigint;
  icrc1FeeMock?: ReturnType<typeof vi.fn>;
}): void {
  vi.spyOn(Actor, "createActor").mockReturnValue({
    list_pools: vi
      .fn()
      .mockResolvedValue([
        createBtcPoolRecord({ max_ltv: 6_500n }),
        createEthPoolRecord(),
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
    icrc1_fee:
      params.icrc1FeeMock ?? vi.fn().mockResolvedValue(params.icrc1Fee),
  } as never);
}
