import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { Actor, type Agent } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, expect, test, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import type { LendingActor } from "../../../core/canisters/lending/actor";
import type { FlexibleLendingActor } from "../../../core/canisters/lending/flexible-actor";
import { CK_CANISTER_IDS, resolveCanisterIds } from "../../../core/config";
import type { _SERVICE as BtcMinter } from "../../../generated/canisters/ck-btc-minter/declaration";
import type { _SERVICE as EthMinter } from "../../../generated/canisters/ck-eth-minter/declaration";
import {
  Chain,
  LiquidiumClient,
  LiquidiumErrorCode,
  type PrepareRecoveryRequest,
} from "../../../index";
import {
  BTC_POOL_ID,
  CHECKSUM_EVM_OUTFLOW_ADDRESS,
  createBtcPoolRecord,
  createEthPoolRecord,
  createIcpPoolRecord,
  createUsdcPoolRecord,
  createUsdtPoolRecord,
  ETH_POOL_ID,
  ICP_POOL_ID,
  USDC_POOL_ID,
  USDT_POOL_ID,
  VALID_BTC_OUTFLOW_ADDRESS,
  VALID_ICP_ACCOUNT_IDENTIFIER,
} from "./test-fixtures";

type RecoveryLendingActor = Pick<FlexibleLendingActor, "list_pools"> &
  Pick<LendingActor, "get_nonce" | "get_prices" | "withdraw_stuck_pool_funds">;

type EthTransactionPrice = Awaited<
  ReturnType<EthMinter["eip_1559_transaction_price"]>
>;

const LENDING_CANISTER_ID = resolveCanisterIds().lending;

const PROFILE_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";

const RECEIVER = "aaaaa-aa";

const RECOVERY_BALANCE = 100_000n;

const LEDGER_FEE = 10n;

const BLOCK_INDEX = 123n;

const NONCE = 7n;

const SIGNATURE = "0xsigned";

const BTC_MINIMUM = 60_000n;

const ETH_MINIMUM = 5_000_000_000_000_000n;

const NETWORK_FEE = 1_000n;

const MINTER_FEE = 100n;

const PRICE_DECIMALS = 2;

const ETH_USDT_PRICE = 200_000n;

const STABLECOIN_USDT_PRICE = 100n;

const ERC_TRANSACTION_FEE_WEI = 100_000_000_000_000n;

const ERC_BURN_FEE = 200_000n;

const TWO_LEDGER_FEES = LEDGER_FEE * 2n;

const THREE_LEDGER_FEES = LEDGER_FEE * 3n;

const ONE_UNIT = 1n;

const BASE_REQUEST: PrepareRecoveryRequest = {
  profileId: PROFILE_ID,
  poolId: USDT_POOL_ID,
  chain: Chain.ICP,
  receiver: RECEIVER,
  signerWalletAddress: CHECKSUM_EVM_OUTFLOW_ADDRESS,
};

afterEach(() => vi.restoreAllMocks());

test.each([
  [BTC_POOL_ID, CK_CANISTER_IDS.BTC.ledger],
  [ETH_POOL_ID, CK_CANISTER_IDS.ETH.ledger],
  [ICP_POOL_ID, CK_CANISTER_IDS.ICP.ledger],
  [USDC_POOL_ID, CK_CANISTER_IDS.USDC.ledger],
  [USDT_POOL_ID, CK_CANISTER_IDS.USDT.ledger],
])(
  "reads the recovery ledger for %s without a position or rejected inflow",
  async (poolId, ledgerId) => {
    // given
    const { client, lending, ledger, createdLedgerIds } = setupRecovery();

    // when
    const balance = await client.lending.getRecoveryBalance(PROFILE_ID, poolId);

    // then
    const EXPECTED_SUBACCOUNT_HEX =
      "06000a0000000000000001010100000000000000000000000000000000000000";

    const [account] = ledger.balance.mock.calls[0] ?? [];

    expect(balance).toBe(RECOVERY_BALANCE);
    expect(account?.owner.toText()).toBe(poolId);
    expect(Buffer.from(account?.subaccount ?? []).toString("hex")).toBe(
      EXPECTED_SUBACCOUNT_HEX
    );
    expect(account?.certified).toBe(false);
    expect(createdLedgerIds()).toEqual([ledgerId]);
    expect(lending.get_nonce).not.toHaveBeenCalled();
    expect(lending.withdraw_stuck_pool_funds).not.toHaveBeenCalled();
  }
);

test("signs the exact canister recovery message and preserves the authorized transfer", async () => {
  // given
  const { client, lending, ledger, createdLedgerIds } = setupRecovery();
  const action = await client.lending.prepareRecovery(BASE_REQUEST);
  const expiry = action.data.expiryTimestamp;

  action.data.amount = ONE_UNIT;
  action.data.poolId = BTC_POOL_ID;
  action.data.receiver = VALID_BTC_OUTFLOW_ADDRESS;
  ledger.balance.mockResolvedValue(RECOVERY_BALANCE + ONE_UNIT);

  // when
  const receipt = await action.submit({
    signature: SIGNATURE,
    chain: Chain.ETH,
  });

  // then
  expect(action.message).toBe(
    `I want to withdraw assets from pool \n Pool Id: ${USDT_POOL_ID}\n Amount: ${RECOVERY_BALANCE}\n Account: Principal:${RECEIVER}\nExpires: ${expiry}\nNonce: ${NONCE}\n`
  );
  expect(new Set(createdLedgerIds())).toEqual(
    new Set([CK_CANISTER_IDS.USDT.ledger])
  );
  expect(lending.withdraw_stuck_pool_funds).toHaveBeenCalledExactlyOnceWith(
    Principal.fromText(PROFILE_ID),
    {
      signature_info: {
        Wallet: {
          account: BASE_REQUEST.signerWalletAddress,
          chain: { ETH: null },
          signature: SIGNATURE,
        },
      },
      data: {
        pool_id: Principal.fromText(USDT_POOL_ID),
        amount: RECOVERY_BALANCE,
        account: { Native: Principal.fromText(RECEIVER) },
        expiry_timestamp: expiry,
      },
    }
  );
  expect(receipt).toEqual({
    amount: RECOVERY_BALANCE,
    ledgerCanisterId: CK_CANISTER_IDS.USDT.ledger,
    blockIndex: BLOCK_INDEX,
    status: {
      operation: "withdrawal",
      state: "processing",
      confirmations: null,
      requiredConfirmations: null,
    },
  });
});

test("executes recovery through the existing wallet adapter", async () => {
  // given
  const { client, lending } = setupRecovery();
  const signMessage = vi.fn().mockResolvedValue(SIGNATURE);

  // when
  await client.lending.recover({
    ...BASE_REQUEST,
    signerChain: Chain.ETH,
    signerWalletAdapter: { signMessage },
  });

  // then
  expect(signMessage).toHaveBeenCalledWith(
    expect.objectContaining({
      actionType: "recover-funds",
      chain: Chain.ETH,
      account: BASE_REQUEST.signerWalletAddress,
    })
  );
  expect(lending.withdraw_stuck_pool_funds).toHaveBeenCalledTimes(1);
});

test("authorizes recovery with a linked BTC wallet", async () => {
  // given
  const { client, lending } = setupRecovery();
  const BTC_SIGNATURE = "0xabcd";
  const signMessage = vi.fn().mockResolvedValue(BTC_SIGNATURE);

  // when
  await client.lending.recover({
    ...BASE_REQUEST,
    signerWalletAddress: VALID_BTC_OUTFLOW_ADDRESS,
    signerChain: Chain.BTC,
    signerWalletAdapter: { signMessage },
  });

  // then
  const EXPECTED_SIGNATURE = "abcd";

  expect(lending.get_nonce).toHaveBeenCalledWith(VALID_BTC_OUTFLOW_ADDRESS);
  expect(lending.withdraw_stuck_pool_funds).toHaveBeenCalledWith(
    Principal.fromText(PROFILE_ID),
    expect.objectContaining({
      signature_info: {
        Wallet: {
          account: VALID_BTC_OUTFLOW_ADDRESS,
          chain: { BTC: null },
          signature: EXPECTED_SIGNATURE,
        },
      },
    })
  );
});

test("uses the ICP signer agent only for the authorized update", async () => {
  // given
  const { client, lending, createActor } = setupRecovery();
  const agent = mockDeep<Agent>();
  const principal = Principal.fromText(PROFILE_ID);
  const SUBACCOUNT_BYTES = 32;
  const subaccount = new Uint8Array(SUBACCOUNT_BYTES).fill(1);

  agent.getPrincipal.mockResolvedValue(principal);

  // when
  await client.lending.recover({
    profileId: PROFILE_ID,
    poolId: USDT_POOL_ID,
    chain: Chain.ICP,
    receiver: RECEIVER,
    authorization: { type: "icp_caller", agent, subaccount },
  });

  // then
  const signedCanisterIds = createActor.mock.calls
    .filter(([, options]) => options.agent === agent)
    .map(([, options]) => String(options.canisterId));

  expect(signedCanisterIds).toEqual([LENDING_CANISTER_ID]);
  expect(lending.get_nonce).not.toHaveBeenCalled();
  expect(lending.withdraw_stuck_pool_funds).toHaveBeenCalledWith(
    principal,
    expect.objectContaining({
      signature_info: { IcpCaller: { principal, subaccount: [subaccount] } },
    })
  );
});

test("rejects an anonymous ICP caller before reading funds", async () => {
  // given
  const { client, lending, ledger } = setupRecovery();
  const agent = mockDeep<Agent>();

  agent.getPrincipal.mockResolvedValue(Principal.anonymous());

  // when
  const result = client.lending.recover({
    ...BASE_REQUEST,
    authorization: { type: "icp_caller", agent },
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.SIGNATURE_ERROR,
  });
  expect(ledger.balance).not.toHaveBeenCalled();
  expect(lending.withdraw_stuck_pool_funds).not.toHaveBeenCalled();
});

test.each([0, 31, 33])(
  "rejects an ICP subaccount of %i bytes before authorization",
  async (length) => {
    // given
    const { client } = setupRecovery();
    const agent = mockDeep<Agent>();

    // when
    const result = client.lending.recover({
      ...BASE_REQUEST,
      authorization: {
        type: "icp_caller",
        agent,
        subaccount: new Uint8Array(length),
      },
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.VALIDATION_ERROR,
    });
    expect(agent.getPrincipal).not.toHaveBeenCalled();
  }
);

test("maps an ICP caller that is not linked to the profile to a signature error", async () => {
  // given
  const { client, lending } = setupRecovery();
  const agent = mockDeep<Agent>();

  agent.getPrincipal.mockResolvedValue(Principal.fromText(PROFILE_ID));
  lending.withdraw_stuck_pool_funds.mockResolvedValue({
    Err: { SignatureError: { IcpCallerMismatch: null } },
  } satisfies Awaited<ReturnType<LendingActor["withdraw_stuck_pool_funds"]>>);

  // when
  const result = client.lending.recover({
    ...BASE_REQUEST,
    authorization: { type: "icp_caller", agent },
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.SIGNATURE_ERROR,
  });
});

test("rejects an empty recovery balance before requesting a signature", async () => {
  // given
  const { client, lending } = setupRecovery(0n);

  // when
  const result = client.lending.prepareRecovery(BASE_REQUEST);

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.INSUFFICIENT_FUNDS,
  });
  expect(lending.get_nonce).not.toHaveBeenCalled();
});

const BOUNDARIES = [
  {
    name: "ICP",
    poolId: ICP_POOL_ID,
    chain: Chain.ICP,
    receiver: RECEIVER,
    minimum: LEDGER_FEE + ONE_UNIT,
  },
  {
    name: "ckBTC",
    poolId: BTC_POOL_ID,
    chain: Chain.ICP,
    receiver: RECEIVER,
    minimum: TWO_LEDGER_FEES + ONE_UNIT,
  },
  {
    name: "ckETH",
    poolId: ETH_POOL_ID,
    chain: Chain.ICP,
    receiver: RECEIVER,
    minimum: TWO_LEDGER_FEES + ONE_UNIT,
  },
  {
    name: "ckUSDT",
    poolId: USDT_POOL_ID,
    chain: Chain.ICP,
    receiver: RECEIVER,
    minimum: TWO_LEDGER_FEES + ONE_UNIT,
  },
  {
    name: "ckUSDC",
    poolId: USDC_POOL_ID,
    chain: Chain.ICP,
    receiver: RECEIVER,
    minimum: TWO_LEDGER_FEES + ONE_UNIT,
  },
  {
    name: "USDT",
    poolId: USDT_POOL_ID,
    chain: Chain.ETH,
    receiver: CHECKSUM_EVM_OUTFLOW_ADDRESS,
    minimum: THREE_LEDGER_FEES + ERC_BURN_FEE + ONE_UNIT,
  },
  {
    name: "USDC",
    poolId: USDC_POOL_ID,
    chain: Chain.ETH,
    receiver: CHECKSUM_EVM_OUTFLOW_ADDRESS,
    minimum: THREE_LEDGER_FEES + ERC_BURN_FEE + ONE_UNIT,
  },
  {
    name: "boosted BTC",
    poolId: BTC_POOL_ID,
    chain: Chain.BTC,
    receiver: VALID_BTC_OUTFLOW_ADDRESS,
    minimum: 4_975n + TWO_LEDGER_FEES + ONE_UNIT,
  },
  {
    name: "minter BTC",
    poolId: BTC_POOL_ID,
    chain: Chain.BTC,
    receiver: VALID_BTC_OUTFLOW_ADDRESS,
    minimum: BTC_MINIMUM + TWO_LEDGER_FEES,
  },
  {
    name: "ETH",
    poolId: ETH_POOL_ID,
    chain: Chain.ETH,
    receiver: CHECKSUM_EVM_OUTFLOW_ADDRESS,
    minimum: ETH_MINIMUM + TWO_LEDGER_FEES,
  },
];

test.each(BOUNDARIES)(
  "rejects $name recovery below its fee boundary",
  async ({ poolId, chain, receiver, minimum }) => {
    // given
    const { client, lending } = setupRecovery(minimum - ONE_UNIT);

    // when
    const result = client.lending.prepareRecovery({
      ...BASE_REQUEST,
      poolId,
      chain,
      receiver,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.RECOVERY_AMOUNT_TOO_LOW,
    });
    expect(lending.get_nonce).not.toHaveBeenCalled();
  }
);

test.each(BOUNDARIES)(
  "accepts $name recovery at its fee boundary",
  async ({ poolId, chain, receiver, minimum }) => {
    // given
    const { client } = setupRecovery(minimum);

    // when
    const action = await client.lending.prepareRecovery({
      ...BASE_REQUEST,
      poolId,
      chain,
      receiver,
    });

    // then
    expect(action.data.amount).toBe(minimum);
  }
);

test("prices the ERC-20 burn with the pool's ckERC20 gas quote", async () => {
  // given
  const { client, ethMinter } = setupRecovery(RECOVERY_BALANCE + ERC_BURN_FEE);

  // when
  await client.lending.prepareRecovery({
    ...BASE_REQUEST,
    chain: Chain.ETH,
    receiver: CHECKSUM_EVM_OUTFLOW_ADDRESS,
  });

  // then
  expect(ethMinter.eip_1559_transaction_price).toHaveBeenCalledWith([
    { ckerc20_ledger_id: Principal.fromText(CK_CANISTER_IDS.USDT.ledger) },
  ]);
});

test("rejects ERC-20 recovery when protocol prices are unavailable", async () => {
  // given
  const { client, lending } = setupRecovery(RECOVERY_BALANCE + ERC_BURN_FEE);

  lending.get_prices.mockResolvedValue([]);

  // when
  const result = client.lending.prepareRecovery({
    ...BASE_REQUEST,
    chain: Chain.ETH,
    receiver: CHECKSUM_EVM_OUTFLOW_ADDRESS,
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.SERVICE_UNAVAILABLE,
  });
  expect(lending.get_nonce).not.toHaveBeenCalled();
});

test("rejects stale recovery amounts after another withdrawal", async () => {
  // given
  const { client, lending, ledger } = setupRecovery();
  const action = await client.lending.prepareRecovery(BASE_REQUEST);

  ledger.balance.mockResolvedValue(RECOVERY_BALANCE - ONE_UNIT);

  // when
  const result = action.submit({ signature: SIGNATURE, chain: Chain.ETH });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.INSUFFICIENT_FUNDS,
  });
  expect(lending.withdraw_stuck_pool_funds).not.toHaveBeenCalled();
});

test("checks increased ledger fees again before submitting", async () => {
  // given
  const { client, lending, ledger } = setupRecovery();
  const action = await client.lending.prepareRecovery(BASE_REQUEST);

  ledger.transactionFee.mockResolvedValue(RECOVERY_BALANCE);

  // when
  const result = action.submit({ signature: SIGNATURE, chain: Chain.ETH });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.RECOVERY_AMOUNT_TOO_LOW,
  });
  expect(lending.withdraw_stuck_pool_funds).not.toHaveBeenCalled();
});

test("maps a canister rejection instead of returning a successful recovery", async () => {
  // given
  const { client, lending } = setupRecovery();

  lending.withdraw_stuck_pool_funds.mockResolvedValue({
    Err: { InvalidTargetPrincipal: null },
  } satisfies Awaited<ReturnType<LendingActor["withdraw_stuck_pool_funds"]>>);

  const action = await client.lending.prepareRecovery(BASE_REQUEST);

  // when
  const result = action.submit({ signature: SIGNATURE, chain: Chain.ETH });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.INVALID_TARGET_PRINCIPAL,
  });
  expect(lending.withdraw_stuck_pool_funds).toHaveBeenCalledTimes(1);
});

test("does not retry an update after an uncertain transport failure", async () => {
  // given
  const { client, lending } = setupRecovery();
  const failure = new Error("Network connection lost");

  lending.withdraw_stuck_pool_funds.mockRejectedValue(failure);

  const action = await client.lending.prepareRecovery(BASE_REQUEST);

  // when
  const result = action.submit({ signature: SIGNATURE, chain: Chain.ETH });

  // then
  await expect(result).rejects.toMatchObject({ cause: failure });
  expect(lending.withdraw_stuck_pool_funds).toHaveBeenCalledTimes(1);
});

test("rejects malformed principal input before making any canister calls", async () => {
  // given
  const { client, lending } = setupRecovery();
  const INVALID_PROFILE = "not-a-principal";

  // when
  const result = client.lending.getRecoveryBalance(
    INVALID_PROFILE,
    USDT_POOL_ID
  );

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.VALIDATION_ERROR,
  });
  expect(lending.list_pools).not.toHaveBeenCalled();
});

test("rejects an empty destination before reading pools", async () => {
  // given
  const { client, lending } = setupRecovery();
  const EMPTY_RECEIVER = "   ";

  // when
  const result = client.lending.prepareRecovery({
    ...BASE_REQUEST,
    receiver: EMPTY_RECEIVER,
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.VALIDATION_ERROR,
  });
  expect(lending.list_pools).not.toHaveBeenCalled();
});

test("rejects a destination on a different chain before requesting a signature", async () => {
  // given
  const { client, lending } = setupRecovery();

  // when
  const result = client.lending.prepareRecovery({
    ...BASE_REQUEST,
    poolId: BTC_POOL_ID,
    chain: Chain.ETH,
    receiver: CHECKSUM_EVM_OUTFLOW_ADDRESS,
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.VALIDATION_ERROR,
  });
  expect(lending.get_nonce).not.toHaveBeenCalled();
});

const ICRC_SPEC_OWNER =
  "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae";

const ICRC_SPEC_SUBACCOUNT = Uint8Array.from(
  { length: 32 },
  (_, index) => index + 1
);

const ICRC_SPEC_ACCOUNT = `${ICRC_SPEC_OWNER}-dfxgiyy.102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20`;

test.each([
  {
    name: "ICRC account",
    receiver: { type: "IcrcAccount" as const, address: ICRC_SPEC_ACCOUNT },
    messageAccount: `Icrc:${ICRC_SPEC_ACCOUNT}`,
    canisterAccount: {
      Icrc: {
        owner: Principal.fromText(ICRC_SPEC_OWNER),
        subaccount: [ICRC_SPEC_SUBACCOUNT],
      },
    },
  },
  {
    name: "ICP account identifier",
    receiver: {
      type: "IcpAccountIdentifier" as const,
      address: VALID_ICP_ACCOUNT_IDENTIFIER.toUpperCase(),
    },
    messageAccount: `AccountId:${VALID_ICP_ACCOUNT_IDENTIFIER}`,
    canisterAccount: { AccountIdentifier: VALID_ICP_ACCOUNT_IDENTIFIER },
  },
])(
  "signs the same $name the canister receives",
  async ({ receiver, messageAccount, canisterAccount }) => {
    // given
    const { client, lending } = setupRecovery();

    const action = await client.lending.prepareRecovery({
      ...BASE_REQUEST,
      poolId: ICP_POOL_ID,
      receiver,
    });

    // when
    await action.submit({ signature: SIGNATURE, chain: Chain.ETH });

    // then
    expect(action.message).toContain(` Account: ${messageAccount}\n`);
    expect(lending.withdraw_stuck_pool_funds).toHaveBeenCalledWith(
      Principal.fromText(PROFILE_ID),
      expect.objectContaining({
        data: expect.objectContaining({ account: canisterAccount }),
      })
    );
  }
);

test("rechecks a native ETH destination that becomes a contract after signing", async () => {
  // given
  const { client, lending, fetch } = setupRecovery(
    ETH_MINIMUM + TWO_LEDGER_FEES
  );

  const action = await client.lending.prepareRecovery({
    ...BASE_REQUEST,
    poolId: ETH_POOL_ID,
    chain: Chain.ETH,
    receiver: CHECKSUM_EVM_OUTFLOW_ADDRESS,
  });

  fetch.mockImplementation(
    async () =>
      new Response(JSON.stringify({ hasDeployedBytecode: true }), {
        headers: { "content-type": "application/json" },
      })
  );

  // when
  const result = action.submit({ signature: SIGNATURE, chain: Chain.ETH });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.CONTRACT_DESTINATION_UNSUPPORTED,
  });
  expect(lending.withdraw_stuck_pool_funds).not.toHaveBeenCalled();
});

test("rejects native BTC recovery when network fees consume the burn amount", async () => {
  // given
  const { client, lending, btcMinter } = setupRecovery();

  btcMinter.estimate_withdrawal_fee.mockResolvedValue({
    bitcoin_fee: RECOVERY_BALANCE,
    minter_fee: MINTER_FEE,
  } satisfies Awaited<ReturnType<BtcMinter["estimate_withdrawal_fee"]>>);

  // when
  const result = client.lending.prepareRecovery({
    ...BASE_REQUEST,
    poolId: BTC_POOL_ID,
    chain: Chain.BTC,
    receiver: VALID_BTC_OUTFLOW_ADDRESS,
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.RECOVERY_AMOUNT_TOO_LOW,
  });
  expect(lending.get_nonce).not.toHaveBeenCalled();
});

test("rejects native ETH recovery when network fees consume the burn amount", async () => {
  // given
  const balance = ETH_MINIMUM + TWO_LEDGER_FEES;
  const { client, lending, ethMinter } = setupRecovery(balance);

  ethMinter.eip_1559_transaction_price.mockResolvedValue(
    createEthTransactionPrice(balance)
  );

  // when
  const result = client.lending.prepareRecovery({
    ...BASE_REQUEST,
    poolId: ETH_POOL_ID,
    chain: Chain.ETH,
    receiver: CHECKSUM_EVM_OUTFLOW_ADDRESS,
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.RECOVERY_AMOUNT_TOO_LOW,
  });
  expect(lending.get_nonce).not.toHaveBeenCalled();
});

test("rejects a native BTC amount above the minter's nat64 limit", async () => {
  // given
  const MAX_BTC_MINTER_AMOUNT_SATS = (1n << 64n) - 1n;

  const { client, lending, btcMinter } = setupRecovery(
    MAX_BTC_MINTER_AMOUNT_SATS + LEDGER_FEE + ONE_UNIT
  );

  // when
  const result = client.lending.prepareRecovery({
    ...BASE_REQUEST,
    poolId: BTC_POOL_ID,
    chain: Chain.BTC,
    receiver: VALID_BTC_OUTFLOW_ADDRESS,
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.VALIDATION_ERROR,
  });
  expect(lending.get_nonce).not.toHaveBeenCalled();
  expect(btcMinter.estimate_withdrawal_fee).not.toHaveBeenCalled();
});

test("accepts a native BTC amount at the minter's nat64 limit", async () => {
  // given
  const MAX_BTC_MINTER_AMOUNT_SATS = (1n << 64n) - 1n;
  const amount = MAX_BTC_MINTER_AMOUNT_SATS + LEDGER_FEE;
  const { client } = setupRecovery(amount);

  // when
  const action = await client.lending.prepareRecovery({
    ...BASE_REQUEST,
    poolId: BTC_POOL_ID,
    chain: Chain.BTC,
    receiver: VALID_BTC_OUTFLOW_ADDRESS,
  });

  // then
  expect(action.data.amount).toBe(amount);
});

test("preserves a ledger read failure rather than treating it as zero balance", async () => {
  // given
  const { client, ledger } = setupRecovery();
  const failure = new Error("Ledger query failed");

  ledger.balance.mockRejectedValue(failure);

  // when
  const result = client.lending.getRecoveryBalance(PROFILE_ID, USDT_POOL_ID);

  // then
  await expect(result).rejects.toMatchObject({ cause: failure });
});

function setupRecovery(balance = RECOVERY_BALANCE) {
  const lending = mockDeep<RecoveryLendingActor>();

  const records = [
    createBtcPoolRecord(),
    createEthPoolRecord(),
    createIcpPoolRecord(),
    createUsdcPoolRecord(),
    createUsdtPoolRecord(),
  ];

  lending.list_pools.mockResolvedValue(
    records.map((record) => ({
      ...record,
      principal: Principal.fromText(record.principal.toText()),
      supply_cap: [],
      borrow_cap: [],
      same_asset_borrowing: [true],
      last_updated: [],
      activation_fee: [],
    })) satisfies Awaited<ReturnType<FlexibleLendingActor["list_pools"]>>
  );
  lending.get_prices.mockResolvedValue([
    ["ETH_USDT", ETH_USDT_PRICE, PRICE_DECIMALS],
    ["USDT_USDT", STABLECOIN_USDT_PRICE, PRICE_DECIMALS],
    ["USDC_USDT", STABLECOIN_USDT_PRICE, PRICE_DECIMALS],
  ] satisfies Awaited<ReturnType<LendingActor["get_prices"]>>);
  lending.get_nonce.mockResolvedValue(NONCE);
  lending.withdraw_stuck_pool_funds.mockResolvedValue({
    Ok: BLOCK_INDEX,
  } satisfies Awaited<ReturnType<LendingActor["withdraw_stuck_pool_funds"]>>);

  const ledger = mockDeep<IcrcLedgerCanister>();

  ledger.balance.mockResolvedValue(balance);
  ledger.transactionFee.mockResolvedValue(LEDGER_FEE);

  const createLedger = vi
    .spyOn(IcrcLedgerCanister, "create")
    .mockReturnValue(ledger);

  const btcMinter = mockDeep<BtcMinter>();
  const btcInfo = mockDeep<Awaited<ReturnType<BtcMinter["get_minter_info"]>>>();

  btcInfo.retrieve_btc_min_amount = BTC_MINIMUM;
  btcMinter.get_minter_info.mockResolvedValue(btcInfo);
  btcMinter.estimate_withdrawal_fee.mockResolvedValue({
    bitcoin_fee: NETWORK_FEE,
    minter_fee: MINTER_FEE,
  } satisfies Awaited<ReturnType<BtcMinter["estimate_withdrawal_fee"]>>);

  const ethMinter = mockDeep<EthMinter>();
  const ethInfo = mockDeep<Awaited<ReturnType<EthMinter["get_minter_info"]>>>();

  ethInfo.minimum_withdrawal_amount = [ETH_MINIMUM];
  ethMinter.get_minter_info.mockResolvedValue(ethInfo);
  ethMinter.eip_1559_transaction_price.mockImplementation(async ([erc20]) =>
    createEthTransactionPrice(erc20 ? ERC_TRANSACTION_FEE_WEI : NETWORK_FEE)
  );

  const actorsByCanisterId = new Map<string, unknown>([
    [LENDING_CANISTER_ID, lending],
    [CK_CANISTER_IDS.BTC.minter, btcMinter],
    [CK_CANISTER_IDS.ETH.minter, ethMinter],
  ]);

  const createActor = vi
    .spyOn(Actor, "createActor")
    .mockImplementation((_idl, options) => {
      const canisterId = String(options.canisterId);
      const routedActor = actorsByCanisterId.get(canisterId);

      if (!routedActor) throw new Error(`Unexpected canister ${canisterId}`);

      // SAFETY: each mock implements the service registered for its canister ID.
      return routedActor as never;
    });

  const createdLedgerIds = () =>
    createLedger.mock.calls.map(([options]) => String(options.canisterId));

  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
    async () =>
      new Response(JSON.stringify({ hasDeployedBytecode: false }), {
        headers: { "content-type": "application/json" },
      })
  );

  const client = new LiquidiumClient({ fetch });

  return {
    client,
    lending,
    ledger,
    createActor,
    createdLedgerIds,
    btcMinter,
    ethMinter,
    fetch,
  };
}

function createEthTransactionPrice(
  maxTransactionFee: bigint
): EthTransactionPrice {
  return {
    max_priority_fee_per_gas: ONE_UNIT,
    max_fee_per_gas: ONE_UNIT,
    max_transaction_fee: maxTransactionFee,
    timestamp: [],
    gas_limit: ONE_UNIT,
  };
}
