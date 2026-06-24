import { Actor } from "@icp-sdk/core/agent";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_API_BASE_URL } from "../../../core/config";
import { LiquidiumClient } from "../../../index";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("LendingModule inflow", () => {
  test("submits an inflow transaction id through the sdk api", async () => {
    // given
    const txid = "7f4f3c2b1a";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ txid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = await client.lending.submitInflow({
      txid,
      operation: "deposit",
    });

    // then
    expect(result).toEqual({
      txid,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/inflow",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ txid, operation: "deposit" }),
        signal: expect.any(AbortSignal),
      }
    );
  });
  test("estimates eth usdt inflow fee by rounding up", async () => {
    // given
    const ETH_DEPOSIT_FEE_ESTIMATE = 1_198_098n;
    const EXPECTED_ROUNDED_FEE = 1_200_000n;
    const estimateDepositFee = vi.fn().mockResolvedValue({
      Ok: ETH_DEPOSIT_FEE_ESTIMATE,
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      estimate_deposit_fee: estimateDepositFee,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const estimate = await client.lending.estimateInflowFee({
      asset: "USDT",
      chain: "ETH",
    });

    // then
    expect(estimate.totalFee).toBe(EXPECTED_ROUNDED_FEE);
    expect(estimateDepositFee).toHaveBeenCalledWith([
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
    ]);
  });

  test("rounds a four-cent eth usdt inflow fee up to ten cents", async () => {
    // given
    const FOUR_CENT_FEE_ESTIMATE = 40_000n;
    const EXPECTED_TEN_CENT_FEE = 100_000n;
    const estimateDepositFee = vi.fn().mockResolvedValue({
      Ok: FOUR_CENT_FEE_ESTIMATE,
    });
    vi.spyOn(Actor, "createActor").mockReturnValue({
      estimate_deposit_fee: estimateDepositFee,
    } as never);
    const client = new LiquidiumClient({});

    // when
    const estimate = await client.lending.estimateInflowFee({
      asset: "USDT",
      chain: "ETH",
    });

    // then
    expect(estimate.totalFee).toBe(EXPECTED_TEN_CENT_FEE);
  });

  test("estimates btc inflow fee by rounding up to sat-level unit", async () => {
    // given
    const BTC_MINTER_DEPOSIT_FEE_SATS = 2_000n;
    const CKBTC_LEDGER_FEE_SATS = 10n;
    const EXPECTED_ROUNDED_FEE_SATS = 2_500n;
    const getDepositFee = vi
      .fn()
      .mockResolvedValue(BTC_MINTER_DEPOSIT_FEE_SATS);
    const icrc1Fee = vi.fn().mockResolvedValue(CKBTC_LEDGER_FEE_SATS);
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({ get_deposit_fee: getDepositFee } as never)
      .mockReturnValueOnce({ icrc1_fee: icrc1Fee } as never);
    const client = new LiquidiumClient({});

    // when
    const estimate = await client.lending.estimateInflowFee({
      asset: "BTC",
      chain: "BTC",
    });

    // then
    expect(estimate.totalFee).toBe(EXPECTED_ROUNDED_FEE_SATS);
    expect(getDepositFee).toHaveBeenCalledWith();
    expect(icrc1Fee).toHaveBeenCalledWith();
  });
  test("uses default prod API base URL for inflow submission without apiBaseUrl", async () => {
    // given
    const TXID = "abc";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ txid: TXID }), {
        status: 200,
      })
    );
    const client = new LiquidiumClient({});

    // when
    const result = await client.lending.submitInflow({
      txid: TXID,
      operation: "deposit",
    });

    // then
    expect(result).toEqual({
      txid: TXID,
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      `${DEFAULT_API_BASE_URL}/v2/inflow`,
      expect.objectContaining({ method: "POST" })
    );
  });
});
