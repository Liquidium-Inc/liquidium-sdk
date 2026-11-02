import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";
import { createLendingActor } from "../../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../../core/canisters/lending/error-mappers";
import { createRecoveryMessage } from "../../../core/canisters/lending/messages";
import { LiquidiumError, LiquidiumErrorCode } from "../../../core/errors";
import { normalizeEvmAddress } from "../../../core/evm";
import { guardEthereumOutflowDestination } from "../../../core/evm-outflow-validation";
import { getPoolLedgerAssetRoute } from "../../../core/pool-ledger-assets";
import { createLiquidiumStatus } from "../../../core/status";
import type { ApiClient } from "../../../core/transports/api-client";
import type { CanisterContext } from "../../../core/transports/canister-context";
import type { Asset, EvmReadClient } from "../../../core/types";
import { normalizeWalletSignature } from "../../../core/utils/signature";
import { computeExpiryTimestampFromNow } from "../../../core/utils/time";
import {
  WalletActionKind,
  WalletExecutionKind,
} from "../../../core/wallet-actions";
import type { SignatureScheme } from "../../../generated/canisters/lending/lending.did";
import {
  mapWalletChainToLendingChain,
  type ParsedOutflowDestination,
  parseOutflowDestination,
  resolveOutflowDestinationInput,
} from "../mappers";
import type {
  PrepareRecoveryRequest,
  RecoverWithIcpRequest,
  RecoveryAction,
  RecoveryRequest,
  RecoveryResult,
} from "../types";
import { validateRecoveryAmount } from "./recovery-validation";
import { getPoolById } from "./supply-targets";

const SUBACCOUNT_LENGTH = 32;

const STUCK_OUTFLOW_PREFIX = 0x06;

const PRINCIPAL_LENGTH_OFFSET = 2;

const PRINCIPAL_START_OFFSET = 3;

export interface RecoveryContext {
  canisterContext: CanisterContext;
  apiClient: ApiClient | undefined;
  evmReadClient: EvmReadClient | undefined;
}

interface RecoveryLedger {
  ledger: IcrcLedgerCanister;
  ledgerCanisterId: string;
}

interface RecoveryAccount {
  owner: Principal;
  subaccount: Uint8Array;
}

interface RecoveryTransfer extends RecoveryLedger {
  profile: Principal;
  pool: Principal;
  account: RecoveryAccount;
  asset: Asset;
  chain: RecoveryRequest["chain"];
  receiver: ParsedOutflowDestination;
  amount: bigint;
  expiryTimestamp: bigint;
}

export async function readRecoveryBalance(
  context: CanisterContext,
  profileId: string,
  poolId: string
): Promise<bigint> {
  const profile = parsePrincipal(profileId);
  const pool = parsePrincipal(poolId);
  const selectedPool = await getPoolById(context, pool.toText());

  const { ledger } = getRecoveryLedger(
    context,
    selectedPool.asset,
    selectedPool.chain
  );

  return readBalance(ledger, recoveryAccount(profile, pool));
}

export async function prepareRecovery(
  context: RecoveryContext,
  request: PrepareRecoveryRequest
): Promise<RecoveryAction> {
  const signerAccount = normalizeEvmAddress(request.signerWalletAddress.trim());

  if (!signerAccount) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Recovery requires a signer account"
    );
  }

  const transfer = await prepareTransfer(context, request);

  await validateTransfer(context, transfer);

  let nonce: bigint;

  try {
    nonce = await createLendingActor(context.canisterContext).get_nonce(
      signerAccount
    );
  } catch (error) {
    throw mapCanisterCallErrorToLiquidiumError("get_nonce", error);
  }

  return {
    kind: WalletActionKind.recoverFunds,
    actionType: WalletActionKind.recoverFunds,
    executionKind: WalletExecutionKind.signMessage,
    account: signerAccount,
    message: createRecoveryMessage(
      {
        pool_id: transfer.pool.toText(),
        amount: transfer.amount.toString(),
        account: transfer.receiver.messageAccount,
        expiry_timestamp: transfer.expiryTimestamp,
      },
      nonce
    ),
    data: {
      profileId: transfer.profile.toText(),
      poolId: transfer.pool.toText(),
      amount: transfer.amount,
      chain: transfer.chain,
      receiver: {
        type: transfer.receiver.accountType,
        address: transfer.receiver.address,
      },
      signerWalletAddress: signerAccount,
      expiryTimestamp: transfer.expiryTimestamp,
    },
    submit: async (signature) =>
      submitTransfer(
        context,
        transfer,
        {
          Wallet: {
            signature: normalizeWalletSignature(
              signature.signature,
              signature.chain
            ),
            chain: mapWalletChainToLendingChain(signature.chain),
            account: signerAccount,
          },
        },
        context.canisterContext
      ),
  };
}

export async function recoverWithIcp(
  context: RecoveryContext,
  request: RecoverWithIcpRequest
): Promise<RecoveryResult> {
  const { agent, subaccount } = request.authorization;

  if (
    request.authorization.type !== "icp_caller" ||
    (subaccount !== undefined && subaccount.length !== SUBACCOUNT_LENGTH)
  ) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "ICP recovery requires an icp_caller authorization and a 32-byte subaccount when provided"
    );
  }

  const callerSubaccount: [] | [Uint8Array] = subaccount
    ? [subaccount.slice()]
    : [];

  const principal = await agent.getPrincipal();

  if (principal.isAnonymous()) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SIGNATURE_ERROR,
      "Recovery requires an authenticated ICP caller"
    );
  }

  const transfer = await prepareTransfer(context, request);

  return submitTransfer(
    context,
    transfer,
    {
      IcpCaller: { principal, subaccount: callerSubaccount },
    },
    { ...context.canisterContext, agent }
  );
}

async function prepareTransfer(
  context: RecoveryContext,
  request: RecoveryRequest
): Promise<RecoveryTransfer> {
  const profile = parsePrincipal(request.profileId);
  const pool = parsePrincipal(request.poolId);

  const destination = resolveOutflowDestinationInput({
    receiver: request.receiver,
    errorMessage: "Recovery requires a destination",
  });

  const selectedPool = await getPoolById(
    context.canisterContext,
    pool.toText()
  );

  const receiver = parseOutflowDestination({
    destination,
    asset: selectedPool.asset,
    poolChain: selectedPool.chain,
    destinationChain: request.chain,
  });

  const { ledger, ledgerCanisterId } = getRecoveryLedger(
    context.canisterContext,
    selectedPool.asset,
    selectedPool.chain
  );

  const account = recoveryAccount(profile, pool);

  return {
    profile,
    pool,
    ledger,
    ledgerCanisterId,
    account,
    asset: selectedPool.asset,
    chain: request.chain,
    receiver,
    amount: await readBalance(ledger, account),
    expiryTimestamp: computeExpiryTimestampFromNow(),
  };
}

async function validateTransfer(
  context: RecoveryContext,
  transfer: RecoveryTransfer
): Promise<void> {
  await guardEthereumOutflowDestination({
    address: transfer.receiver.address,
    asset: transfer.asset,
    chain: transfer.chain,
    apiClient: context.apiClient,
    evmReadClient: context.evmReadClient,
  });

  try {
    await validateRecoveryAmount({
      canisterContext: context.canisterContext,
      ledger: transfer.ledger,
      ledgerCanisterId: transfer.ledgerCanisterId,
      asset: transfer.asset,
      chain: transfer.chain,
      amount: transfer.amount,
    });
  } catch (error) {
    if (error instanceof LiquidiumError) throw error;

    throw mapCanisterCallErrorToLiquidiumError("recovery preflight", error);
  }
}

async function submitTransfer(
  context: RecoveryContext,
  transfer: RecoveryTransfer,
  signature: SignatureScheme,
  submitContext: CanisterContext
): Promise<RecoveryResult> {
  // Recheck fees and the signed balance without increasing the authorized amount.
  await validateTransfer(context, transfer);

  const balance = await readBalance(transfer.ledger, transfer.account);

  if (balance < transfer.amount) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INSUFFICIENT_FUNDS,
      "Recovery balance changed; prepare a new recovery"
    );
  }

  try {
    const result = await createLendingActor(
      submitContext
    ).withdraw_stuck_pool_funds(transfer.profile, {
      signature_info: signature,
      data: {
        pool_id: transfer.pool,
        account: transfer.receiver.canisterAccount,
        amount: transfer.amount,
        expiry_timestamp: transfer.expiryTimestamp,
      },
    });

    if ("Err" in result)
      throw mapLendingProtocolErrorToLiquidiumError(result.Err);

    return {
      amount: transfer.amount,
      ledgerCanisterId: transfer.ledgerCanisterId,
      blockIndex: result.Ok,
      status: createLiquidiumStatus({
        operation: "withdrawal",
        state: "processing",
      }),
    };
  } catch (error) {
    if (error instanceof LiquidiumError) throw error;

    throw mapCanisterCallErrorToLiquidiumError(
      "withdraw_stuck_pool_funds",
      error
    );
  }
}

async function readBalance(
  ledger: IcrcLedgerCanister,
  account: RecoveryAccount
): Promise<bigint> {
  try {
    return await ledger.balance({ ...account, certified: false });
  } catch (error) {
    throw mapCanisterCallErrorToLiquidiumError("icrc1_balance_of", error);
  }
}

function getRecoveryLedger(
  context: CanisterContext,
  asset: Asset,
  chain: string
): RecoveryLedger {
  const { ledgerCanisterId } = getPoolLedgerAssetRoute({ asset, chain });

  return {
    ledgerCanisterId,
    ledger: IcrcLedgerCanister.create({
      agent: context.agent,
      canisterId: Principal.fromText(ledgerCanisterId),
    }),
  };
}

function recoveryAccount(profile: Principal, pool: Principal): RecoveryAccount {
  const subaccount = new Uint8Array(SUBACCOUNT_LENGTH);
  const principalBytes = profile.toUint8Array();

  subaccount[0] = STUCK_OUTFLOW_PREFIX;
  subaccount[PRINCIPAL_LENGTH_OFFSET] = principalBytes.length;
  subaccount.set(principalBytes, PRINCIPAL_START_OFFSET);

  return { owner: pool, subaccount };
}

function parsePrincipal(value: string): Principal {
  try {
    return Principal.fromText(value);
  } catch (error) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Recovery requires valid profile and pool principals",
      error
    );
  }
}
