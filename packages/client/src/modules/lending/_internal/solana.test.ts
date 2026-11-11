import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { base58 } from "@scure/base";
import { afterEach, expect, expectTypeOf, test, vi } from "vite-plus/test";
import { mockDeep } from "vitest-mock-extended";
import { decodeIcrcAccountAddress } from "../../../core/accounts";
import {
  MAX_SOL_AMOUNT_LAMPORTS,
  validateSolAddress,
  validateSolAmount,
} from "../../../core/address-validation";
import type { CkSolMinterActor } from "../../../core/canisters/cksol/minter";
import type { IcrcLedgerActor } from "../../../core/canisters/icrc/ledger";
import type { LendingActor } from "../../../core/canisters/lending/actor";
import type {
  FlexibleLendingActor,
  FlexiblePool,
  FlexiblePositionView,
} from "../../../core/canisters/lending/flexible-actor";
import { CK_CANISTER_IDS } from "../../../core/config";
import { encodeInflowSubaccount } from "../../../core/utils/inflow-subaccount";
import { normalizeWalletSignature } from "../../../core/utils/signature";
import {
  type AssetIdentifier,
  LiquidiumClient,
  LiquidiumErrorCode,
  type SupplyTarget,
} from "../../../index";
import { parseOutflowDestination } from "../mappers";
import type { EstimateInflowFeeRequest } from "../types";
import { createBtcPoolRecord } from "./test-fixtures";

type SolTestActor = Pick<
  FlexibleLendingActor,
  "list_pools" | "get_pool_rate" | "get_position"
> &
  Pick<CkSolMinterActor, "get_deposit_address" | "get_minter_info"> &
  IcrcLedgerActor &
  Pick<
    LendingActor,
    "get_nonce" | "get_wallet_profile" | "register_profile" | "withdraw"
  >;

const SOL_POOL_ID = "efo3x-cyaaa-aaaae-qkpva-cai";
const PROFILE_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";
const SOL_CANISTER_IDS = { pools: { sol: SOL_POOL_ID } };
const SOL_ADDRESS = "So11111111111111111111111111111111111111112";
const SIGNATURE_BYTES = 64;
const TXID = base58.encode(new Uint8Array(SIGNATURE_BYTES).fill(7));
const MINIMUM_SEND_LAMPORTS = 20_000_000n;
const FEE_LAMPORTS = 1_000_000n;
const SENDER_FEE_LAMPORTS = 5_000n;
const MINTER_MINIMUM_WITHDRAWAL_LAMPORTS = 2_000_000n;
const CKSOL_LEDGER_FEE_LAMPORTS = 500n;
const SOL_OUTFLOW_LEDGER_FEE_COUNT = 2n;

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test("validates decoded SOL address length and preserves case", () => {
  // given
  const address = SOL_ADDRESS;
  const invalidAddress = base58.encode(new Uint8Array(31));

  // when
  const normalized = validateSolAddress(address);

  // then
  expect(normalized).toBe(address);
  expect(() => validateSolAddress(invalidAddress)).toThrow();
  expect(() => validateSolAddress("0OIl")).toThrow();
});

test("accepts uint64 SOL bounds and rejects zero and overflow", () => {
  // given
  const maximum = MAX_SOL_AMOUNT_LAMPORTS;

  // when
  const validateMaximum = () => validateSolAmount(maximum);

  // then
  expect(validateMaximum).not.toThrow();
  expect(() => validateSolAmount(0n)).toThrow();
  expect(() => validateSolAmount(-1n)).toThrow();
  expect(() => validateSolAmount(maximum + 1n)).toThrow();
});

test("normalizes only 64-byte hex SOL message signatures", () => {
  // given
  const signature = "ab".repeat(SIGNATURE_BYTES);

  // when
  const normalized = normalizeWalletSignature(`0x${signature}`, "SOL");

  // then
  expect(normalized).toBe(signature);
  expect(() => normalizeWalletSignature(signature.slice(2), "SOL")).toThrow();
  expect(() => normalizeWalletSignature(TXID, "SOL")).toThrow();
});

test("creates a profile with a SOL wallet and hex Ed25519 authorization", async () => {
  // given
  const actor = createSolActor();
  const signatureHex = "ab".repeat(SIGNATURE_BYTES);
  const signMessage = vi.fn(async () => `0x${signatureHex}`);
  const client = new LiquidiumClient({});

  // when
  const profileId = await client.accounts.createProfile({
    account: SOL_ADDRESS,
    chain: "SOL",
    walletAdapter: { signMessage },
  });

  // then
  expect(profileId).toBe(PROFILE_ID);
  expect(signMessage).toHaveBeenCalledWith(
    expect.objectContaining({ chain: "SOL", account: SOL_ADDRESS })
  );
  expect(actor.register_profile).toHaveBeenCalledWith(
    expect.objectContaining({
      signature_info: {
        Wallet: {
          chain: { SOL: null },
          account: SOL_ADDRESS,
          signature: signatureHex,
        },
      },
    })
  );
});

test("uses the active SOL pool for both native and ckSOL discovery", async () => {
  // given
  const retiredPoolId = "556yw-gqaaa-aaaae-qj5aa-cai";
  const actor = createSolActor();
  actor.list_pools.mockResolvedValue([
    solPool(retiredPoolId),
    solPool(SOL_POOL_ID),
  ]);

  const client = new LiquidiumClient({
    canisterIds: { pools: { sol: SOL_POOL_ID } },
  });

  // when
  const native = await client.market.findPool({ asset: "SOL", chain: "SOL" });
  const wrapped = await client.market.findPool({ asset: "SOL", chain: "ICP" });

  // then
  expect(native.id).toBe(SOL_POOL_ID);
  expect(wrapped.id).toBe(native.id);
  expect(native.decimals).toBe(9n);
});

test("derives native deposit and repayment targets from separate pool-owned subaccounts", async () => {
  // given
  const actor = createSolActor();
  const client = new LiquidiumClient({ canisterIds: SOL_CANISTER_IDS });

  // when
  for (const action of ["deposit", "repayment"] as const) {
    await client.lending.supply({
      profileId: PROFILE_ID,
      poolId: SOL_POOL_ID,
      action,
      chain: "SOL",
    });
  }

  // then
  for (const action of ["deposit", "repayment"] as const) {
    expect(actor.get_deposit_address).toHaveBeenCalledWith({
      owner: [Principal.fromText(SOL_POOL_ID)],
      subaccount: [
        encodeInflowSubaccount({
          action,
          principal: Principal.fromText(PROFILE_ID),
        }),
      ],
    });
  }
});

test.each(["deposit", "repayment"] as const)(
  "blocks a below-minimum SOL %s before wallet broadcast",
  async (action) => {
    // given
    createSolActor();
    const sendSolTransaction = vi.fn();

    const client = new LiquidiumClient({
      fetch: feeFetch(),
      canisterIds: SOL_CANISTER_IDS,
    });

    // when
    const result = client.lending.supply({
      profileId: PROFILE_ID,
      poolId: SOL_POOL_ID,
      action,
      chain: "SOL",
      account: SOL_ADDRESS,
      amount: MINIMUM_SEND_LAMPORTS - 1n,
      walletAdapter: { sendSolTransaction },
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
    });
    expect(sendSolTransaction).not.toHaveBeenCalled();
  }
);

test("returns the SOL signature even when post-broadcast indexing fails", async () => {
  // given
  vi.useFakeTimers();
  createSolActor();
  const fetch = feeFetch();
  const sendSolTransaction = vi.fn().mockResolvedValue(TXID);
  const client = new LiquidiumClient({ fetch, canisterIds: SOL_CANISTER_IDS });

  // when
  const result = client.lending.supply({
    profileId: PROFILE_ID,
    poolId: SOL_POOL_ID,
    action: "deposit",
    chain: "SOL",
    account: SOL_ADDRESS,
    amount: MINIMUM_SEND_LAMPORTS,
    walletAdapter: { sendSolTransaction },
  });

  await vi.runAllTimersAsync();
  const flow = await result;

  // then
  expect(flow.txid).toBe(TXID);
  expect(sendSolTransaction).toHaveBeenCalledExactlyOnceWith({
    chain: "SOL",
    toAddress: SOL_ADDRESS,
    amountLamports: MINIMUM_SEND_LAMPORTS,
    account: SOL_ADDRESS,
    actionType: "supply-deposit",
  });
  expect(
    fetch.mock.calls.some(
      ([, init]) =>
        init?.body ===
        JSON.stringify({ txid: TXID, chain: "SOL", operation: "deposit" })
    )
  ).toBe(true);
});

test("sends ckSOL to the correct ledger and repayment subaccount", async () => {
  // given
  createSolActor();
  const sendIcrcTransfer = vi.fn().mockResolvedValue("123");

  const client = new LiquidiumClient({
    fetch: feeFetch(),
    canisterIds: SOL_CANISTER_IDS,
  });

  // when
  const flow = await client.lending.supply({
    profileId: PROFILE_ID,
    poolId: SOL_POOL_ID,
    action: "repayment",
    chain: "ICP",
    account: PROFILE_ID,
    amount: MINIMUM_SEND_LAMPORTS,
    walletAdapter: { sendIcrcTransfer },
  });

  // then
  const account = decodeIcrcAccountAddress(flow.target.address);
  expect(account.owner.toText()).toBe(SOL_POOL_ID);
  expect(account.subaccount).toEqual(
    encodeInflowSubaccount({
      action: "repayment",
      principal: Principal.fromText(PROFILE_ID),
    })
  );
  expect(sendIcrcTransfer).toHaveBeenCalledWith(
    expect.objectContaining({
      asset: "SOL",
      transfer: expect.objectContaining({
        ledgerCanisterId: CK_CANISTER_IDS.SOL.ledger,
      }),
    })
  );
});

test("keeps pre-SOL fee request call shapes assignable", () => {
  // then
  expectTypeOf<AssetIdentifier>().toExtend<EstimateInflowFeeRequest>();
  expectTypeOf<SupplyTarget>().toExtend<EstimateInflowFeeRequest>();
});

test("requires account context for SOL fees and never returns a fallback on failure", async () => {
  // given
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockRejectedValue(new Error("offline"));

  const client = new LiquidiumClient({ fetch });

  // when
  const missingContext = client.lending.estimateInflowFee({
    asset: "SOL",
    chain: "SOL",
  } as never);

  // then
  await expect(missingContext).rejects.toMatchObject({
    code: LiquidiumErrorCode.VALIDATION_ERROR,
  });
  expect(fetch).not.toHaveBeenCalled();
  await expect(
    client.lending.estimateInflowFee({
      asset: "SOL",
      chain: "ICP",
      profileId: PROFILE_ID,
      poolId: SOL_POOL_ID,
      action: "repayment",
    })
  ).rejects.toThrow();
});

test("validates native SOL destinations and restricts ckSOL outflows to principals", () => {
  // given
  const request = {
    asset: "SOL",
    poolChain: "SOL",
    destinationChain: "SOL",
    destination: SOL_ADDRESS,
  };

  // when
  const destination = parseOutflowDestination(request);

  // then
  expect(destination.canisterAccount).toEqual({ External: SOL_ADDRESS });
  expect(() =>
    parseOutflowDestination({ ...request, destination: "invalid" })
  ).toThrow();
  expect(
    parseOutflowDestination({
      ...request,
      destinationChain: "ICP",
      destination: PROFILE_ID,
    }).canisterAccount
  ).toEqual({ Native: Principal.fromText(PROFILE_ID) });
  expect(() =>
    parseOutflowDestination({ ...request, destinationChain: "ICP" })
  ).toThrow();
});

test("rejects SOL inflow targets for a pool other than the configured one", async () => {
  // given
  const retiredPoolId = "556yw-gqaaa-aaaae-qj5aa-cai";
  const actor = createSolActor();
  actor.list_pools.mockResolvedValue([
    solPool(retiredPoolId),
    solPool(SOL_POOL_ID),
  ]);
  const client = new LiquidiumClient({ canisterIds: SOL_CANISTER_IDS });

  // when
  const results = (["SOL", "ICP"] as const).map((chain) =>
    client.lending.supply({
      profileId: PROFILE_ID,
      poolId: retiredPoolId,
      action: "deposit",
      chain,
    })
  );

  // then
  for (const result of results) {
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
    });
  }

  expect(actor.get_deposit_address).not.toHaveBeenCalled();
});

test("requires native SOL withdrawals to cover the minter minimum and ledger fees", async () => {
  // given
  createSolActor();
  const client = new LiquidiumClient({ canisterIds: SOL_CANISTER_IDS });

  const minimumLamports =
    MINTER_MINIMUM_WITHDRAWAL_LAMPORTS +
    CKSOL_LEDGER_FEE_LAMPORTS * SOL_OUTFLOW_LEDGER_FEE_COUNT;

  const withdraw = (amount: bigint, chain: "SOL" | "ICP", receiver: string) =>
    client.lending.prepareWithdraw({
      profileId: PROFILE_ID,
      poolId: SOL_POOL_ID,
      amount,
      chain,
      receiver,
      signerWalletAddress: SOL_ADDRESS,
    });

  // when
  const belowMinimum = withdraw(minimumLamports - 1n, "SOL", SOL_ADDRESS);
  const atMinimum = withdraw(minimumLamports, "SOL", SOL_ADDRESS);
  const smallCkSol = withdraw(1_000_000n, "ICP", PROFILE_ID);

  // then
  await expect(belowMinimum).rejects.toMatchObject({
    code: LiquidiumErrorCode.VALIDATION_ERROR,
  });
  await expect(atMinimum).resolves.toMatchObject({ account: SOL_ADDRESS });
  await expect(smallCkSol).resolves.toMatchObject({ account: SOL_ADDRESS });
});

test("rechecks the native SOL floor when a prepared withdrawal is submitted", async () => {
  // given
  const actor = createSolActor();
  const client = new LiquidiumClient({ canisterIds: SOL_CANISTER_IDS });

  const preparedLamports =
    MINTER_MINIMUM_WITHDRAWAL_LAMPORTS +
    CKSOL_LEDGER_FEE_LAMPORTS * SOL_OUTFLOW_LEDGER_FEE_COUNT;

  const action = await client.lending.prepareWithdraw({
    profileId: PROFILE_ID,
    poolId: SOL_POOL_ID,
    amount: preparedLamports,
    chain: "SOL",
    receiver: SOL_ADDRESS,
    signerWalletAddress: SOL_ADDRESS,
  });

  actor.get_minter_info.mockResolvedValue({
    minimum_withdrawal_amount: preparedLamports,
    withdrawal_fee: 1_000_000n,
  } satisfies Awaited<ReturnType<SolTestActor["get_minter_info"]>>);

  // when
  const result = action.submit({
    signature: "ab".repeat(SIGNATURE_BYTES),
    chain: "SOL",
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.VALIDATION_ERROR,
  });
  expect(actor.withdraw).not.toHaveBeenCalled();
});

function solPool(poolId: string): FlexiblePool {
  return {
    ...createBtcPoolRecord(poolId),
    principal: Principal.fromText(poolId),
    asset: { SOL: null },
    chain: { SOL: null },
    supply_cap: [],
    borrow_cap: [],
    same_asset_borrowing: [true],
    last_updated: [],
    activation_fee: [],
  };
}

function createSolActor() {
  const actor = mockDeep<SolTestActor>();
  actor.list_pools.mockResolvedValue([solPool(SOL_POOL_ID)] satisfies Awaited<
    ReturnType<SolTestActor["list_pools"]>
  >);
  actor.get_pool_rate.mockResolvedValue([[0n, 0n, 0n]] satisfies Awaited<
    ReturnType<SolTestActor["get_pool_rate"]>
  >);
  const position = mockDeep<FlexiblePositionView>({ debt_native_now: 1n });
  actor.get_position.mockResolvedValue([position] satisfies Awaited<
    ReturnType<SolTestActor["get_position"]>
  >);
  actor.get_deposit_address.mockResolvedValue(
    SOL_ADDRESS satisfies Awaited<
      ReturnType<SolTestActor["get_deposit_address"]>
    >
  );
  actor.get_minter_info.mockResolvedValue({
    minimum_withdrawal_amount: MINTER_MINIMUM_WITHDRAWAL_LAMPORTS,
    withdrawal_fee: 1_000_000n,
  } satisfies Awaited<ReturnType<SolTestActor["get_minter_info"]>>);
  actor.icrc1_fee.mockResolvedValue(
    CKSOL_LEDGER_FEE_LAMPORTS satisfies Awaited<
      ReturnType<SolTestActor["icrc1_fee"]>
    >
  );
  actor.get_nonce.mockResolvedValue(
    0n satisfies Awaited<ReturnType<SolTestActor["get_nonce"]>>
  );
  actor.get_wallet_profile.mockResolvedValue(
    [] satisfies Awaited<ReturnType<SolTestActor["get_wallet_profile"]>>
  );
  actor.register_profile.mockResolvedValue({
    Ok: Principal.fromText(PROFILE_ID),
  } satisfies Awaited<ReturnType<SolTestActor["register_profile"]>>);
  vi.spyOn(Actor, "createActor").mockReturnValue(actor as never);

  return actor;
}

function feeFetch() {
  return vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    if (String(input).includes("/solana/inflow-fee?")) {
      return Response.json({
        totalFee: FEE_LAMPORTS.toString(),
        minimumSendAmount: MINIMUM_SEND_LAMPORTS.toString(),
        walletTransferFee: SENDER_FEE_LAMPORTS.toString(),
      });
    }

    return Response.json(
      { error: "transaction not finalised" },
      { status: 404 }
    );
  });
}
