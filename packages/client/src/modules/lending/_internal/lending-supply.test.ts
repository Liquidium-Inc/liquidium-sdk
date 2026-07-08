import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { decodeFunctionData } from "viem";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CK_DEPOSIT_ABI, ERC20_ABI } from "../../../core/evm";
import { encodeInflowSubaccount } from "../../../core/utils/inflow-subaccount";
import { LiquidiumClient, LiquidiumErrorCode } from "../../../index";
import {
  BTC_POOL_ID,
  createBtcPoolRecord,
  createIcpPoolRecord,
  createUsdcPoolRecord,
  encodeBytes32Hex,
  encodePrincipalToBytes32,
  ICP_POOL_ID,
  LONG_RETRY_TEST_TIMEOUT_MS,
  mockUsdtPoolList,
  USDC_POOL_ID,
  USDT_POOL_ID,
} from "./test-fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("LendingModule supply", () => {
  test("returns a native supply target for the btc pool", async () => {
    // given
    const profileId = "aaaaa-aa";
    const getBtcAddress = vi
      .fn()
      .mockResolvedValue("bc1qexampledepositaddress");
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => BTC_POOL_ID,
              toText: () => BTC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { BTC: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { BTC: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: getBtcAddress,
      } as never);
    const client = new LiquidiumClient({});

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: BTC_POOL_ID,
      action: "deposit",
    });

    // then
    expect(supplyFlow).toMatchObject({
      type: "transfer",
      target: {
        type: "ChainAddress",
        poolId: BTC_POOL_ID,
        asset: "BTC",
        chain: "BTC",
        action: "deposit",
        address: "bc1qexampledepositaddress",
      },
    });
    expect(getBtcAddress).toHaveBeenCalledTimes(1);
    const getBtcAddressRequest = getBtcAddress.mock.calls[0]?.[0];
    expect(getBtcAddressRequest?.owner[0]?.toText()).toBe(BTC_POOL_ID);
    expect(Array.from(getBtcAddressRequest?.subaccount[0] ?? [])).toEqual(
      Array.from(
        encodeInflowSubaccount({
          action: "deposit",
          principal: Principal.fromText(profileId),
        })
      )
    );
  });

  test("returns a deposit address supply target for the usdt pool", async () => {
    // given
    const profileId = "aaaaa-aa";
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x1111111111111111111111111111111111111111",
    });
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => USDT_POOL_ID,
              toText: () => USDT_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { USDT: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { ETH: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: getDepositAddress,
      } as never);
    const client = new LiquidiumClient({});

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: USDT_POOL_ID,
      action: "repayment",
    });

    // then
    expect(supplyFlow).toMatchObject({
      type: "transfer",
      target: {
        type: "ChainAddress",
        poolId: USDT_POOL_ID,
        asset: "USDT",
        chain: "ETH",
        action: "repayment",
        address: "0x1111111111111111111111111111111111111111",
      },
    });
    expect(getDepositAddress).toHaveBeenCalledTimes(1);
    const depositAddressRequest = getDepositAddress.mock.calls[0]?.[0];
    expect(depositAddressRequest?.owner.toText()).toBe(USDT_POOL_ID);
    expect(Array.from(depositAddressRequest?.subaccount[0] ?? [])).toEqual(
      Array.from(
        encodeInflowSubaccount({
          action: "repayment",
          principal: Principal.fromText(profileId),
        })
      )
    );
    expect(getDepositAddress.mock.calls[0]?.[1]).toEqual([
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
    ]);
  });

  test("returns a deposit address supply target for the usdc pool when transfer is requested", async () => {
    // given
    const profileId = "aaaaa-aa";
    const getDepositAddress = vi.fn().mockResolvedValue({
      Ok: "0x2222222222222222222222222222222222222222",
    });
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => USDC_POOL_ID,
              toText: () => USDC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { USDC: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { ETH: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: getDepositAddress,
      } as never);
    const client = new LiquidiumClient({});

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: USDC_POOL_ID,
      action: "deposit",
    });

    // then
    expect(supplyFlow).toMatchObject({
      type: "transfer",
      target: {
        type: "ChainAddress",
        poolId: USDC_POOL_ID,
        asset: "USDC",
        chain: "ETH",
        action: "deposit",
        address: "0x2222222222222222222222222222222222222222",
      },
    });
    expect(getDepositAddress).toHaveBeenCalledTimes(1);
    const depositAddressRequest = getDepositAddress.mock.calls[0]?.[0];
    expect(depositAddressRequest?.owner.toText()).toBe(USDC_POOL_ID);
    expect(Array.from(depositAddressRequest?.subaccount[0] ?? [])).toEqual(
      Array.from(
        encodeInflowSubaccount({
          action: "deposit",
          principal: Principal.fromText(profileId),
        })
      )
    );
    expect(getDepositAddress.mock.calls[0]?.[1]).toEqual([
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    ]);
  });

  test("returns a ckBTC ICRC account target when ck transfer mode is requested", async () => {
    // given
    const profileId = "aaaaa-aa";
    const expectedSubaccount = encodeInflowSubaccount({
      action: "deposit",
      principal: Principal.fromText(profileId),
    });
    vi.spyOn(Actor, "createActor").mockReturnValueOnce({
      list_pools: vi.fn().mockResolvedValue([createBtcPoolRecord()]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: BTC_POOL_ID,
      action: "deposit",
      chain: "ICP",
    });

    // then
    expect(supplyFlow.target).toEqual({
      type: "IcrcAccount",
      poolId: BTC_POOL_ID,
      asset: "BTC",
      chain: "ICP",
      action: "deposit",
      account: {
        type: "IcrcAccount",
        owner: BTC_POOL_ID,
        subaccount: expectedSubaccount,
        address: encodeIcrcAccount({
          owner: Principal.fromText(BTC_POOL_ID),
          subaccount: expectedSubaccount,
        }),
      },
    });
  });

  test("returns a ckUSDC ICRC account target when ck transfer mode is requested", async () => {
    // given
    const profileId = "aaaaa-aa";
    const expectedSubaccount = encodeInflowSubaccount({
      action: "repayment",
      principal: Principal.fromText(profileId),
    });
    vi.spyOn(Actor, "createActor").mockReturnValueOnce({
      list_pools: vi.fn().mockResolvedValue([createUsdcPoolRecord()]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: USDC_POOL_ID,
      action: "repayment",
      chain: "ICP",
    });

    // then
    expect(supplyFlow.target).toEqual({
      type: "IcrcAccount",
      poolId: USDC_POOL_ID,
      asset: "USDC",
      chain: "ICP",
      action: "repayment",
      account: {
        type: "IcrcAccount",
        owner: USDC_POOL_ID,
        subaccount: expectedSubaccount,
        address: encodeIcrcAccount({
          owner: Principal.fromText(USDC_POOL_ID),
          subaccount: expectedSubaccount,
        }),
      },
    });
  });

  test("returns an ICP ledger target with ICRC and account identifier formats", async () => {
    // given
    const profileId = "aaaaa-aa";
    const expectedSubaccount = encodeInflowSubaccount({
      action: "deposit",
      principal: Principal.fromText(profileId),
    });
    vi.spyOn(Actor, "createActor").mockReturnValueOnce({
      list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
    } as never);
    const client = new LiquidiumClient({});

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: ICP_POOL_ID,
      action: "deposit",
    });

    // then
    expect(supplyFlow.target).toMatchObject({
      type: "IcpLedgerAccount",
      poolId: ICP_POOL_ID,
      asset: "ICP",
      chain: "ICP",
      action: "deposit",
      account: {
        icpIcrcAccount: {
          type: "IcrcAccount",
          owner: ICP_POOL_ID,
          subaccount: expectedSubaccount,
          address: encodeIcrcAccount({
            owner: Principal.fromText(ICP_POOL_ID),
            subaccount: expectedSubaccount,
          }),
        },
      },
    });
    expect(
      supplyFlow.target.type === "IcpLedgerAccount"
        ? supplyFlow.target.account.icpAccountIdentifier
        : ""
    ).toMatch(/^[0-9a-f]{64}$/);
  });

  test("should not submit eth stablecoin transfer txids through the inflow endpoint", async () => {
    // given
    const profileId = "aaaaa-aa";
    const txid =
      "0x76ffa8bd3b89187c1a54b9f9c0adcd53da15623b38dc80304937fe962243b86e";
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => USDC_POOL_ID,
              toText: () => USDC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { USDC: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { ETH: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: vi.fn().mockResolvedValue({
          Ok: "0x2222222222222222222222222222222222222222",
        }),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const supplyFlow = await client.lending.supply({
      profileId,
      poolId: USDC_POOL_ID,
      action: "deposit",
    });
    const result = await supplyFlow.submit({ txid });

    // then
    expect(result).toEqual({
      txid,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("rejects supply when the selected asset and chain pair is unsupported", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => USDT_POOL_ID,
            toText: () => USDT_POOL_ID,
          },
          total_generated_interest_snapshot: 0n,
          supply_cap: [],
          same_asset_borrowing: [],
          asset: { ICP: null },
          rate_slope_before: 1n,
          borrow_cap: [],
          total_debt_at_last_sync: 0n,
          chain: { ETH: null },
          rate_slope_after: 2n,
          reserve_factor: 100n,
          last_updated: [],
          lending_index: 300n,
          protocol_liquidation_fee: 50n,
          borrow_index: 400n,
          base_rate: 5n,
          frozen: false,
          liquidation_bonus: 200n,
          liquidation_threshold: 7_500n,
          max_ltv: 7_000n,
          total_supply_at_last_sync: 50_000n,
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending.supply({
        profileId: "aaaaa-aa",
        poolId: USDT_POOL_ID,
        action: "deposit",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "No supply mechanism is configured for ICP on ETH",
    });
  });

  test("rejects native btc supply when pool id is not configured btc pool", async () => {
    // given
    const NON_CONFIGURED_BTC_POOL_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai";
    vi.spyOn(Actor, "createActor").mockReturnValue({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => NON_CONFIGURED_BTC_POOL_ID,
            toText: () => NON_CONFIGURED_BTC_POOL_ID,
          },
          total_generated_interest_snapshot: 0n,
          supply_cap: [],
          same_asset_borrowing: [],
          asset: { BTC: null },
          rate_slope_before: 1n,
          borrow_cap: [],
          total_debt_at_last_sync: 0n,
          chain: { BTC: null },
          rate_slope_after: 2n,
          reserve_factor: 100n,
          last_updated: [],
          lending_index: 300n,
          protocol_liquidation_fee: 50n,
          borrow_index: 400n,
          base_rate: 5n,
          frozen: false,
          liquidation_bonus: 200n,
          liquidation_threshold: 7_500n,
          max_ltv: 7_000n,
          total_supply_at_last_sync: 50_000n,
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending.supply({
        profileId: "aaaaa-aa",
        poolId: NON_CONFIGURED_BTC_POOL_ID,
        action: "deposit",
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Chain-address BTC inflow targets require the configured BTC pool hkmli-faaaa-aaaar-qb4ba-cai, received ryjl3-tyaaa-aaaaa-aaaba-cai",
    });
  });

  test("rejects contract-interaction supply for the btc pool", async () => {
    // given
    vi.spyOn(Actor, "createActor").mockReturnValueOnce({
      list_pools: vi.fn().mockResolvedValue([
        {
          optimal_utilization_rate: 80n,
          principal: {
            toString: () => BTC_POOL_ID,
            toText: () => BTC_POOL_ID,
          },
          total_generated_interest_snapshot: 0n,
          supply_cap: [],
          same_asset_borrowing: [],
          asset: { BTC: null },
          rate_slope_before: 1n,
          borrow_cap: [],
          total_debt_at_last_sync: 0n,
          chain: { BTC: null },
          rate_slope_after: 2n,
          reserve_factor: 100n,
          last_updated: [],
          lending_index: 300n,
          protocol_liquidation_fee: 50n,
          borrow_index: 400n,
          base_rate: 5n,
          frozen: false,
          liquidation_bonus: 200n,
          liquidation_threshold: 7_500n,
          max_ltv: 7_000n,
          total_supply_at_last_sync: 50_000n,
        },
      ]),
    } as never);
    const client = new LiquidiumClient({});

    // when

    // then
    await expect(
      client.lending.supply({
        profileId: "aaaaa-aa",
        poolId: BTC_POOL_ID,
        action: "deposit",
        mechanism: "contractInteraction",
        walletAdapter: {
          sendEthTransaction: vi.fn(),
        },
        account: "0x1234567890123456789012345678901234567890",
        amount: 1_000_000n,
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "Contract-interaction supply is not supported for BTC on BTC",
    });
  });

  test("computes evm supply context with the configured EVM read client", async () => {
    // given
    mockUsdtPoolList();
    const readContract = vi
      .fn()
      .mockResolvedValueOnce(0n)
      .mockResolvedValueOnce(2_000_000n);
    const client = new LiquidiumClient({
      evmPublicClient: { readContract } as never,
    });

    // when
    const result = await client.lending.getEvmSupplyContext({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      walletAddress: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      action: "deposit",
    });

    // then
    expect(result).toMatchObject({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      walletAddress: "0x1234567890123456789012345678901234567890",
      action: "deposit",
      asset: "USDT",
      chain: "ETH",
      amount: "1000000",
      tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      spenderAddress: "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
      depositContractAddress: "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
      balance: "2000000",
      allowance: "0",
      requiresApproval: true,
      approvalStrategy: "approve-max",
    });
    expect(readContract).toHaveBeenCalledTimes(2);
    expect(readContract).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        functionName: "allowance",
        args: [
          "0x1234567890123456789012345678901234567890",
          "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
        ],
      })
    );
    expect(readContract).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        functionName: "balanceOf",
        args: ["0x1234567890123456789012345678901234567890"],
      })
    );
  });

  test("should return reset approval strategy for partial EVM allowance", async () => {
    // given
    mockUsdtPoolList();
    const readContract = vi
      .fn()
      .mockResolvedValueOnce(500_000n)
      .mockResolvedValueOnce(2_000_000n);
    const client = new LiquidiumClient({
      evmPublicClient: { readContract } as never,
    });

    // when
    const result = await client.lending.getEvmSupplyContext({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      walletAddress: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      action: "deposit",
    });

    // then
    expect(result.allowance).toBe("500000");
    expect(result.requiresApproval).toBe(true);
    expect(result.approvalStrategy).toBe("reset-then-approve-max");
  });
  test("auto-executes eth usdt supply with a deposit address transfer", async () => {
    // given
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => USDT_POOL_ID,
              toText: () => USDT_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { USDT: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { ETH: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_deposit_address: vi.fn().mockResolvedValue({
          Ok: "0x1111111111111111111111111111111111111111",
        }),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const sendEthTransaction = vi.fn().mockResolvedValueOnce("0xdeposit");
    const client = new LiquidiumClient({});

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      action: "deposit",
      account: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      walletAdapter: {
        sendEthTransaction,
      },
    });

    // then
    expect(flow.type).toBe("transfer");
    expect(flow.target).toMatchObject({
      type: "ChainAddress",
      asset: "USDT",
      chain: "ETH",
      address: "0x1111111111111111111111111111111111111111",
    });
    expect(flow.txid).toBe("0xdeposit");
    expect(sendEthTransaction).toHaveBeenCalledTimes(1);
    expect(sendEthTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        chain: "ETH",
        actionType: "supply-deposit",
        transaction: expect.objectContaining({
          to: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          data: expect.stringMatching(/^0xa9059cbb/),
        }),
      })
    );
    const sentEthTransaction = sendEthTransaction.mock.calls[0]?.[0];
    const decodedTransfer = decodeFunctionData({
      abi: ERC20_ABI,
      data: sentEthTransaction?.transaction.data as `0x${string}`,
    });
    expect(decodedTransfer.functionName).toBe("transfer");
    expect(decodedTransfer.args).toEqual([
      "0x1111111111111111111111111111111111111111",
      1_000_000n,
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("auto-executes eth usdt supply with contract interaction when requested", async () => {
    // given
    const profileId = "aaaaa-aa";
    const depositTxid = "0xcontractdeposit";
    mockUsdtPoolList();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ txid: depositTxid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const readContract = vi
      .fn()
      .mockResolvedValueOnce(1_000_000n)
      .mockResolvedValueOnce(2_000_000n);
    const sendEthTransaction = vi.fn().mockResolvedValueOnce(depositTxid);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      evmPublicClient: { readContract } as never,
    });

    // when
    const flow = await client.lending.supply({
      profileId,
      poolId: USDT_POOL_ID,
      action: "deposit",
      account: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      mechanism: "contractInteraction",
      walletAdapter: {
        sendEthTransaction,
      },
    });

    // then
    expect(flow.type).toBe("contractInteraction");
    expect(flow.target).toMatchObject({
      type: "IcrcAccount",
      asset: "USDT",
      chain: "ETH",
    });
    expect(flow.txid).toBe(depositTxid);
    expect(sendEthTransaction).toHaveBeenCalledTimes(1);
    expect(sendEthTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        chain: "ETH",
        actionType: "supply-deposit-deposit-erc20",
        transaction: expect.objectContaining({
          to: "0x18901044688D3756C35Ed2b36D93e6a5B8e00E68",
          data: expect.stringMatching(/^0xdb9751af/),
        }),
      })
    );
    const sentEthTransaction = sendEthTransaction.mock.calls[0]?.[0];
    const decodedDeposit = decodeFunctionData({
      abi: CK_DEPOSIT_ABI,
      data: sentEthTransaction?.transaction.data as `0x${string}`,
    });
    expect(decodedDeposit.functionName).toBe("depositErc20");
    expect(decodedDeposit.args[0].toLowerCase()).toBe(
      "0xdac17f958d2ee523a2206206994597c13d831ec7"
    );
    expect(decodedDeposit.args[1]).toBe(1_000_000n);
    expect(decodedDeposit.args[2]).toBe(
      encodePrincipalToBytes32(Principal.fromText(USDT_POOL_ID))
    );
    expect(decodedDeposit.args[3]).toBe(
      encodeBytes32Hex(
        encodeInflowSubaccount({
          action: "deposit",
          principal: Principal.fromText(profileId),
        })
      )
    );
    expect(readContract).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "https://app.liquidium.fi/api/sdk/v2/inflow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          txid: depositTxid,
          chain: "ETH",
          operation: "deposit",
        }),
      })
    );
  });

  test("should return contract-interaction txid when inflow registration fails after broadcast", async () => {
    // given
    const profileId = "aaaaa-aa";
    const depositTxid = "0xcontractdeposit";
    const API_FAILURE = new Error("api unavailable");
    mockUsdtPoolList();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(API_FAILURE);
    const readContract = vi
      .fn()
      .mockResolvedValueOnce(1_000_000n)
      .mockResolvedValueOnce(2_000_000n);
    const sendEthTransaction = vi.fn().mockResolvedValueOnce(depositTxid);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      evmPublicClient: { readContract } as never,
    });

    // when
    const flow = await client.lending.supply({
      profileId,
      poolId: USDT_POOL_ID,
      action: "deposit",
      account: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      mechanism: "contractInteraction",
      walletAdapter: {
        sendEthTransaction,
      },
    });

    // then
    expect(flow.type).toBe("contractInteraction");
    expect(flow.txid).toBe(depositTxid);
    expect(sendEthTransaction).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  test("should require an EVM read client for contract-interaction supply", async () => {
    // given
    mockUsdtPoolList();
    const sendEthTransaction = vi.fn();
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const result = client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: USDT_POOL_ID,
      action: "deposit",
      account: "0x1234567890123456789012345678901234567890",
      amount: 1_000_000n,
      mechanism: "contractInteraction",
      walletAdapter: {
        sendEthTransaction,
      },
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message:
        "Contract-interaction supply requires an EVM RPC URL or public client",
    });
    expect(sendEthTransaction).not.toHaveBeenCalled();
  });

  test("creates a supply flow that exposes the target and submits a broadcast txid", async () => {
    // given
    const txid = "session-txid-1";
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => BTC_POOL_ID,
              toText: () => BTC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { BTC: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { BTC: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qexampledepositaddress"),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
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
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
    });
    await flow.submit({ txid });

    // then
    expect(flow.type).toBe("transfer");
    expect(flow.target).toMatchObject({
      type: "ChainAddress",
      address: "bc1qexampledepositaddress",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/inflow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          chain: "BTC",
          operation: "deposit",
          txid,
        }),
      })
    );
  });

  test("auto-submits BTC inflow when supply receives a wallet adapter", async () => {
    // given
    const txid = "auto-submit-txid";
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => BTC_POOL_ID,
              toText: () => BTC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { BTC: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { BTC: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qexampledepositaddress"),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ txid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const sendBtcTransaction = vi.fn().mockResolvedValue(txid);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
      amount: 100_000n,
      walletAdapter: {
        sendBtcTransaction,
      },
      account: "bc1qsender",
    });

    // then
    expect(flow.type).toBe("transfer");
    expect(flow.txid).toBe(txid);
    expect(sendBtcTransaction).toHaveBeenCalledWith({
      chain: "BTC",
      toAddress: "bc1qexampledepositaddress",
      amountSats: 100_000n,
      account: "bc1qsender",
      actionType: "supply-deposit",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/inflow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          txid,
          chain: "BTC",
          operation: "deposit",
        }),
      })
    );
  });

  test("executes ckUSDC supply with an ICRC wallet transfer", async () => {
    // given
    const txid = "42";
    vi.spyOn(Actor, "createActor").mockReturnValueOnce({
      list_pools: vi.fn().mockResolvedValue([createUsdcPoolRecord()]),
    } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const sendIcrcTransfer = vi.fn().mockResolvedValue(txid);
    const client = new LiquidiumClient({});

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: USDC_POOL_ID,
      action: "repayment",
      chain: "ICP",
      amount: 1_000_000n,
      account: "icrc-sender",
      walletAdapter: {
        sendIcrcTransfer,
      },
    });

    // then
    expect(flow.txid).toBe(txid);
    expect(sendIcrcTransfer).toHaveBeenCalledWith({
      asset: "USDC",
      account: "icrc-sender",
      actionType: "supply-repayment",
      chain: "ICP",
      transfer: {
        ledgerCanisterId: "xevnm-gaaaa-aaaar-qafnq-cai",
        to:
          flow.target.type === "IcrcAccount" ? flow.target.account : undefined,
        amount: 1_000_000n,
      },
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("executes ICP supply with an ICRC wallet transfer in native transfer mode", async () => {
    // given
    const txid = "123";
    vi.spyOn(Actor, "createActor").mockReturnValueOnce({
      list_pools: vi.fn().mockResolvedValue([createIcpPoolRecord()]),
    } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const sendIcrcTransfer = vi.fn().mockResolvedValue(txid);
    const client = new LiquidiumClient({});

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: ICP_POOL_ID,
      action: "deposit",
      amount: 100_000_000n,
      account: "icp-sender",
      walletAdapter: {
        sendIcrcTransfer,
      },
    });

    // then
    expect(flow.txid).toBe(txid);
    expect(sendIcrcTransfer).toHaveBeenCalledWith({
      chain: "ICP",
      asset: "ICP",
      account: "icp-sender",
      actionType: "supply-deposit",
      transfer: {
        ledgerCanisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
        to:
          flow.target.type === "IcpLedgerAccount"
            ? flow.target.account.icpIcrcAccount
            : undefined,
        amount: 100_000_000n,
      },
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("retries BTC inflow submission when the API temporarily fails", async () => {
    // given
    const txid = "retry-submit-txid";
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => BTC_POOL_ID,
              toText: () => BTC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { BTC: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { BTC: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qexampledepositaddress"),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: "An internal error occurred. Please contact support.",
        }),
        {
          status: 500,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ txid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const sendBtcTransaction = vi.fn().mockResolvedValue(txid);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "deposit",
      amount: 100_000n,
      walletAdapter: {
        sendBtcTransaction,
      },
      account: "bc1qsender",
    });

    // then
    expect(flow.type).toBe("transfer");
    expect(flow.txid).toBe(txid);
    expect(sendBtcTransaction).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "https://app.liquidium.fi/api/sdk/v2/inflow",
      expect.objectContaining({
        body: JSON.stringify({
          txid,
          chain: "BTC",
          operation: "deposit",
        }),
      })
    );
  });

  test(
    "should return BTC txid when inflow registration fails after broadcast",
    async () => {
      // given
      const txid = "post-broadcast-registration-failed-txid";
      vi.spyOn(Actor, "createActor")
        .mockReturnValueOnce({
          list_pools: vi.fn().mockResolvedValue([
            {
              optimal_utilization_rate: 80n,
              principal: {
                toString: () => BTC_POOL_ID,
                toText: () => BTC_POOL_ID,
              },
              total_generated_interest_snapshot: 0n,
              supply_cap: [],
              same_asset_borrowing: [],
              asset: { BTC: null },
              rate_slope_before: 1n,
              borrow_cap: [],
              total_debt_at_last_sync: 0n,
              chain: { BTC: null },
              rate_slope_after: 2n,
              reserve_factor: 100n,
              last_updated: [],
              lending_index: 300n,
              protocol_liquidation_fee: 50n,
              borrow_index: 400n,
              base_rate: 5n,
              frozen: false,
              liquidation_bonus: 200n,
              liquidation_threshold: 7_500n,
              max_ltv: 7_000n,
              total_supply_at_last_sync: 50_000n,
            },
          ]),
        } as never)
        .mockReturnValueOnce({
          get_btc_address: vi
            .fn()
            .mockResolvedValue("bc1qexampledepositaddress"),
        } as never);
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            message: "Resource not found",
          }),
          {
            status: 503,
            headers: {
              "content-type": "application/json",
            },
          }
        )
      );
      const sendBtcTransaction = vi.fn().mockResolvedValue(txid);
      const client = new LiquidiumClient({
        apiBaseUrl: "https://app.liquidium.fi/api/sdk",
      });

      // when
      const flow = await client.lending.supply({
        profileId: "aaaaa-aa",
        poolId: BTC_POOL_ID,
        action: "deposit",
        amount: 100_000n,
        walletAdapter: {
          sendBtcTransaction,
        },
        account: "bc1qsender",
      });

      // then
      const EXPECTED_SUBMIT_ATTEMPTS = 4;
      expect(flow.type).toBe("transfer");
      expect(flow.txid).toBe(txid);
      expect(sendBtcTransaction).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(EXPECTED_SUBMIT_ATTEMPTS);
      expect(fetchSpy).toHaveBeenNthCalledWith(
        1,
        "https://app.liquidium.fi/api/sdk/v2/inflow",
        expect.objectContaining({
          body: JSON.stringify({
            txid,
            chain: "BTC",
            operation: "deposit",
          }),
        })
      );
    },
    LONG_RETRY_TEST_TIMEOUT_MS
  );

  test("auto-submits BTC repayment inflows with the REPAY submit type", async () => {
    // given
    const txid = "auto-repay-txid";
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => BTC_POOL_ID,
              toText: () => BTC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { BTC: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { BTC: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qexamplerepayaddress"),
      } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ txid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    const sendBtcTransaction = vi.fn().mockResolvedValue(txid);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when
    const flow = await client.lending.supply({
      profileId: "aaaaa-aa",
      poolId: BTC_POOL_ID,
      action: "repayment",
      amount: 100_000n,
      walletAdapter: {
        sendBtcTransaction,
      },
      account: "bc1qsender",
    });

    // then
    expect(flow.type).toBe("transfer");
    expect(flow.txid).toBe(txid);
    expect(sendBtcTransaction).toHaveBeenCalledTimes(1);
    expect(sendBtcTransaction).toHaveBeenCalledWith({
      chain: "BTC",
      toAddress: "bc1qexamplerepayaddress",
      amountSats: 100_000n,
      account: "bc1qsender",
      actionType: "supply-repayment",
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://app.liquidium.fi/api/sdk/v2/inflow",
      expect.objectContaining({
        body: JSON.stringify({
          txid,
          chain: "BTC",
          operation: "repayment",
        }),
      })
    );
  });

  test("throws when wallet-executed supply adapter cannot send BTC", async () => {
    // given
    vi.spyOn(Actor, "createActor")
      .mockReturnValueOnce({
        list_pools: vi.fn().mockResolvedValue([
          {
            optimal_utilization_rate: 80n,
            principal: {
              toString: () => BTC_POOL_ID,
              toText: () => BTC_POOL_ID,
            },
            total_generated_interest_snapshot: 0n,
            supply_cap: [],
            same_asset_borrowing: [],
            asset: { BTC: null },
            rate_slope_before: 1n,
            borrow_cap: [],
            total_debt_at_last_sync: 0n,
            chain: { BTC: null },
            rate_slope_after: 2n,
            reserve_factor: 100n,
            last_updated: [],
            lending_index: 300n,
            protocol_liquidation_fee: 50n,
            borrow_index: 400n,
            base_rate: 5n,
            frozen: false,
            liquidation_bonus: 200n,
            liquidation_threshold: 7_500n,
            max_ltv: 7_000n,
            total_supply_at_last_sync: 50_000n,
          },
        ]),
      } as never)
      .mockReturnValueOnce({
        get_btc_address: vi.fn().mockResolvedValue("bc1qexampledepositaddress"),
      } as never);
    const client = new LiquidiumClient({
      apiBaseUrl: "https://app.liquidium.fi/api/sdk",
    });

    // when

    // then
    await expect(
      client.lending.supply({
        profileId: "aaaaa-aa",
        poolId: BTC_POOL_ID,
        action: "deposit",
        amount: 100_000n,
        account: "bc1qsender",
        walletAdapter: {},
      })
    ).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
      message: "BTC wallet adapter does not support transaction sending",
    });
  });
});
