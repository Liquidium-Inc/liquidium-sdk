import { Actor } from "@icp-sdk/core/agent";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  LiquidiumClient,
  LiquidiumErrorCode,
  publicIdFromInt,
} from "../../../index";
import {
  BTC_POOL_ID,
  createBtcPoolRecord,
  createSimpleLoan,
  createSimpleLoanPosition,
  createUsdtPoolRecord,
  LOAN_ID,
  PROFILE_ID,
  USDT_POOL_ID,
} from "./test-fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("SimpleLoansModule find", () => {
  test("finds manage-ready loan results by string query", async () => {
    // given
    const getLoan = vi.fn().mockResolvedValue({
      Ok: createSimpleLoan(),
    });
    const getBtcAddress = vi.fn().mockResolvedValue("bc1qinstantdeposit");
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    const getPoolRate = vi
      .fn()
      .mockResolvedValue([[10_000_000_000_000_000_000_000_000n, 0n, 0n]]);
    const estimateDepositFee = vi.fn().mockResolvedValue({ Ok: 1_500_000n });
    const getDepositFee = vi.fn().mockResolvedValue(2_000n);
    const icrc1Fee = vi.fn().mockResolvedValue(10n);
    const getCollateralPosition = vi.fn().mockResolvedValue([
      createSimpleLoanPosition(
        BTC_POOL_ID,
        { BTC: null },
        {
          deposited_native_now: 10_000_000n,
        }
      ),
    ]);
    const getBorrowPosition = vi.fn().mockResolvedValue([
      createSimpleLoanPosition(
        USDT_POOL_ID,
        { USDT: null },
        {
          debt_native_now: 2_000_000n,
          total_debt_interest: 1_000n,
        }
      ),
    ]);
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) => {
        const url = input.toString();
        if (url.includes("/instant-loans/find?query=42")) {
          return new Response(
            JSON.stringify({
              success: true,
              candidates: [
                {
                  loan_id: LOAN_ID.toString(),
                  short_ref: publicIdFromInt(LOAN_ID),
                  profile: PROFILE_ID,
                  created_at: "2026-05-27T08:16:26.194Z",
                  lend_asset: "BTC",
                  borrow_asset: "USDT",
                  collateral_amount: "10000000",
                  lend_pool_ic_id: BTC_POOL_ID,
                  borrow_pool_ic_id: USDT_POOL_ID,
                },
              ],
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        if (url.includes("/instant-loans/42/collateral-hint")) {
          return new Response(
            JSON.stringify({
              success: true,
              collateralAmountHint: "10000000",
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
        throw new Error(`Unexpected fetch URL: ${url}`);
      });

    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({ get_loan: getLoan } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
      } as never)
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([createUsdtPoolRecord()]),
      } as never)
      .mockReturnValueOnce({ get_position: getCollateralPosition } as never)
      .mockReturnValueOnce({ get_position: getBorrowPosition } as never)
      .mockReturnValueOnce({ get_pool_rate: getPoolRate } as never)
      .mockReturnValueOnce({ get_btc_address: getBtcAddress } as never)
      .mockReturnValueOnce({ get_deposit_address: getDepositAddress } as never)
      .mockReturnValueOnce({
        estimate_deposit_fee: estimateDepositFee,
      } as never)
      .mockReturnValueOnce({ get_deposit_fee: getDepositFee } as never)
      .mockReturnValueOnce({ icrc1_fee: icrc1Fee } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const results = await client.simpleLoans.find(LOAN_ID.toString());

    // then
    expect(results).toHaveLength(1);
    expect(results[0]?.loanId).toBe(LOAN_ID);
    expect(results[0]?.ref).toBe(publicIdFromInt(LOAN_ID));
    expect(results[0]?.createdAt).toBe(1_779_869_786n);
    expect(results[0]?.collateral).toEqual({
      poolId: BTC_POOL_ID,
      asset: "BTC",
      amount: 10_000_000n,
    });
    expect(results[0]?.borrow).toEqual({
      poolId: USDT_POOL_ID,
      asset: "USDT",
    });
    expect(results[0]?.profileId).toBe(PROFILE_ID);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v1/instant-loans/find?query=42",
      expect.objectContaining({ method: "GET" })
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("should return a typed error when the API returns a malformed success payload", async () => {
    // given
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          candidates: [
            {
              loan_id: "not-a-number",
              short_ref: publicIdFromInt(LOAN_ID),
              profile: PROFILE_ID,
              created_at: "2026-05-27T08:16:26.194Z",
              lend_asset: "BTC",
              borrow_asset: "USDT",
              collateral_amount: "10000000",
              lend_pool_ic_id: BTC_POOL_ID,
              borrow_pool_ic_id: USDT_POOL_ID,
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = client.simpleLoans.find(LOAN_ID.toString());

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Invalid simple loan loan ID",
    });
  });

  test("maps native ETH collateral and borrow assets from find results", async () => {
    // given
    const ETH_POOL_ID = "qcg7y-syaaa-aaaar-qb75q-cai";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          candidates: [
            {
              loan_id: LOAN_ID.toString(),
              short_ref: publicIdFromInt(LOAN_ID),
              profile: PROFILE_ID,
              created_at: "2026-05-27T08:16:26.194Z",
              lend_asset: "ETH",
              borrow_asset: "ETH",
              collateral_amount: "5000000000000000",
              lend_pool_ic_id: ETH_POOL_ID,
              borrow_pool_ic_id: ETH_POOL_ID,
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    const client = new LiquidiumClient({});

    // when
    const results = await client.simpleLoans.find("0xeth-transaction");

    // then
    expect(results[0]).toMatchObject({
      collateral: {
        poolId: ETH_POOL_ID,
        asset: "ETH",
        amount: 5_000_000_000_000_000n,
      },
      borrow: { poolId: ETH_POOL_ID, asset: "ETH" },
    });
  });
});
