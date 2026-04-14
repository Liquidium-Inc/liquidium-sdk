import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { createCkBtcMinterActor } from "../../core/canisters/ckbtc/minter";
import {
  createLendingActor,
  type LendingPoolRecord,
} from "../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { SupplyAction } from "../../core/types";
import { parseBigInt } from "../../core/utils/bigint";
import { encodeInflowSubaccount } from "../../core/utils/inflow-subaccount";
import { retryWithBackoff } from "../../core/utils/retry";
import { computeExpiryTimestampFromNow } from "../../core/utils/time";
import { getVariantKey } from "../../core/utils/variant";
import type { WalletAdapter } from "../../core/wallet-actions";
import { executeWith } from "../../execute";
import type { UserHistoryEntry, UserHistoryResponse } from "../history/types";
import type {
  BorrowAction,
  BorrowSubmitSignatureInfo,
  CreateBorrowRequest,
  CreateWithdrawRequest,
  GetInflowStatusRequest,
  GetInflowStatusResponse,
  IcrcAccountSupplyTarget,
  NativeAddressSupplyTarget,
  OutflowDetails,
  SubmitInflowRequest,
  SubmitInflowResponse,
  SupplyFlow,
  SupplyFlowRequest,
  SupplyInstruction,
  SupplyRequest,
  SupplyTarget,
  SupplyTrackingStatus,
  WithdrawAction,
  WithdrawSubmitSignatureInfo,
} from "./types";

const BITCOIN_BLOCK_TIME_MS = 10 * 60 * 1000;
const HISTORY_OUTFLOW_LIMIT = 20;
const HISTORY_OUTFLOW_LOOKBACK_1_MINUTE_MS = 60_000;
const SUBMIT_INFLOW_MAX_ATTEMPTS = 4;
const SUBMIT_INFLOW_INITIAL_RETRY_DELAY_MS = 1_500;
const SUBMIT_INFLOW_RETRY_BACKOFF_MULTIPLIER = 2;

type LendingModuleOptions = {
  supplyStatusPollIntervalMs: number;
};

type WalletChain = "BTC" | "ETH";

type WalletExecutionParams = {
  signerChain: WalletChain;
  signerWalletAdapter: WalletAdapter;
};

type OutflowRequestData = {
  profileId: string;
  poolId: string;
  amount: bigint;
  receiverAddress: string;
  signerWalletAddress: string;
  expiryTimestamp: bigint;
};

type SupplyTargetRequest = {
  poolId: string;
  asset: string;
  chain: string;
  action: SupplyAction;
};

type MessageAccount = {
  type: "Native" | "External";
  data: string;
};

type OutflowMessageRequest = {
  pool_id: string;
  amount: string;
  account: MessageAccount;
  expiry_timestamp: bigint;
};

type LendingChainVariant = { BTC: null } | { ETH: null };

type CanisterOutflowReceiver = { Native: Principal } | { External: string };

type CanisterOutflowRecord = {
  id: string;
  txid: [] | [string];
  outflow_type: Record<string, null>;
  outflow_ref: [] | [string];
  amount: bigint;
  receiver: CanisterOutflowReceiver;
};

export class LendingModule {
  constructor(
    readonly canisterContext: CanisterContext,
    readonly apiClient: ApiClient | undefined,
    readonly options: LendingModuleOptions
  ) {}

  /**
   * Prepares a withdraw action that can be signed and submitted later.
   *
   * Use this when you need explicit control over signing and submission.
   */
  async prepareWithdraw(
    request: CreateWithdrawRequest
  ): Promise<WithdrawAction> {
    const destinationAccount = request.receiverAddress.trim();
    const signerAccount = request.signerWalletAddress.trim();
    if (!destinationAccount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Withdraw requires a custom outflow account"
      );
    }
    if (!signerAccount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Withdraw requires a signer account"
      );
    }

    const lendingActor = createLendingActor(this.canisterContext);

    try {
      const expiryTimestamp = computeExpiryTimestampFromNow();
      const nonce = await lendingActor.get_nonce(signerAccount);
      const withdrawRequestData = {
        profileId: request.profileId,
        poolId: request.poolId,
        amount: request.amount,
        receiverAddress: destinationAccount,
        signerWalletAddress: signerAccount,
        expiryTimestamp,
      };

      return {
        kind: "create-withdraw",
        executionKind: "sign-message",
        actionType: "create-withdraw",
        transferMode: "native",
        account: signerAccount,
        message: createWithdrawAssetMessage(
          {
            pool_id: request.poolId,
            amount: request.amount.toString(),
            account: { type: "External", data: destinationAccount },
            expiry_timestamp: expiryTimestamp,
          },
          nonce
        ),
        data: withdrawRequestData,
        submit: async (signatureInfo: WithdrawSubmitSignatureInfo) => {
          return await this.submitWithdraw(withdrawRequestData, signatureInfo);
        },
      };
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_nonce", error);
    }
  }

  private async submitWithdraw(
    request: OutflowRequestData,
    signatureInfo: WithdrawSubmitSignatureInfo
  ): Promise<OutflowDetails> {
    try {
      const result = await createLendingActor(this.canisterContext).withdraw(
        Principal.fromText(request.profileId),
        {
          data: {
            expiry_timestamp: request.expiryTimestamp,
            account: { External: request.receiverAddress },
            pool_id: Principal.fromText(request.poolId),
            amount: request.amount,
          },
          signature_info: {
            Wallet: {
              signature: signatureInfo.signature,
              chain: mapWalletChainToLendingChain(signatureInfo.chain),
              account: request.signerWalletAddress,
            },
          },
        }
      );

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapCanisterOutflowDetails(result.Ok);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("withdraw", error);
    }
  }

  /**
   * Creates a withdraw outflow using the provided wallet adapter.
   *
   * This is the convenience form of `prepareWithdraw(...)` plus execution.
   */
  async withdraw(
    params: CreateWithdrawRequest & WalletExecutionParams
  ): Promise<OutflowDetails> {
    const action = await this.prepareWithdraw(params);

    return await executeWith({
      walletAdapter: params.signerWalletAdapter,
      chain: params.signerChain,
      account: params.signerWalletAddress,
    })(action);
  }

  /**
   * Prepares a borrow action that can be signed and submitted later.
   *
   * Use this when you need explicit control over signing and submission.
   */
  async prepareBorrow(request: CreateBorrowRequest): Promise<BorrowAction> {
    const destinationAccount = request.receiverAddress.trim();
    const signerAccount = request.signerWalletAddress.trim();
    if (!destinationAccount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Borrow requires a custom outflow account"
      );
    }
    if (!signerAccount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Borrow requires a signer account"
      );
    }

    const lendingActor = createLendingActor(this.canisterContext);

    try {
      const expiryTimestamp = computeExpiryTimestampFromNow();
      const nonce = await lendingActor.get_nonce(signerAccount);
      const borrowRequestData = {
        profileId: request.profileId,
        poolId: request.poolId,
        amount: request.amount,
        receiverAddress: destinationAccount,
        signerWalletAddress: signerAccount,
        expiryTimestamp,
      };

      return {
        kind: "create-borrow",
        executionKind: "sign-message",
        actionType: "create-borrow",
        transferMode: "native",
        account: signerAccount,
        message: createBorrowAssetMessage(
          {
            pool_id: request.poolId,
            amount: request.amount.toString(),
            account: { type: "External", data: destinationAccount },
            expiry_timestamp: expiryTimestamp,
          },
          nonce
        ),
        data: borrowRequestData,
        submit: async (signatureInfo: BorrowSubmitSignatureInfo) => {
          return await this.submitBorrow(borrowRequestData, signatureInfo);
        },
      };
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_nonce", error);
    }
  }

  private async submitBorrow(
    request: OutflowRequestData,
    signatureInfo: BorrowSubmitSignatureInfo
  ): Promise<OutflowDetails> {
    try {
      const result = await createLendingActor(
        this.canisterContext
      ).borrow_assets(Principal.fromText(request.profileId), {
        data: {
          expiry_timestamp: request.expiryTimestamp,
          account: { External: request.receiverAddress },
          pool_id: Principal.fromText(request.poolId),
          amount: request.amount,
        },
        signature_info: {
          Wallet: {
            signature: signatureInfo.signature,
            chain: mapWalletChainToLendingChain(signatureInfo.chain),
            account: request.signerWalletAddress,
          },
        },
      });

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapCanisterOutflowDetails(result.Ok);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("borrow_assets", error);
    }
  }

  /**
   * Creates a borrow outflow using the provided wallet adapter.
   *
   * This is the convenience form of `prepareBorrow(...)` plus execution.
   */
  async borrow(
    params: CreateBorrowRequest &
      WalletExecutionParams & { waitForTxid?: boolean }
  ): Promise<OutflowDetails> {
    const borrowSubmittedAtMs = Date.now();
    const action = await this.prepareBorrow(params);

    const outflow = await executeWith({
      walletAdapter: params.signerWalletAdapter,
      chain: params.signerChain,
      account: params.signerWalletAddress,
    })(action);

    const shouldWaitForTxid = params.waitForTxid ?? Boolean(this.apiClient);

    if (!shouldWaitForTxid || outflow.txid) {
      return outflow;
    }

    return await this.waitForOutflowTxid({
      profileId: params.profileId,
      poolId: params.poolId,
      amount: params.amount,
      outflow,
      outflowType: "borrow",
      submittedAtMs: borrowSubmittedAtMs,
      pollIntervalMs: this.options.supplyStatusPollIntervalMs,
    });
  }

  /**
   * Prepares supply instructions for a deposit or repayment flow.
   *
   * The returned instruction describes where funds should be sent.
   */
  async prepareSupply(request: SupplyRequest): Promise<SupplyInstruction> {
    const supplyTarget = await this.resolveSupplyTarget(request);

    return {
      poolId: request.poolId,
      asset: supplyTarget.asset,
      chain: supplyTarget.chain,
      action: request.action,
      target: supplyTarget,
    };
  }

  /**
   * Creates a tracked supply flow for a deposit or repayment.
   *
   * This builds the supply instruction and returns helpers for txid submission
   * and status tracking. When `btcWalletAdapter` is provided, BTC native-address
   * supplies are auto-broadcast and auto-submitted by this method.
   */
  async supply(request: SupplyFlowRequest): Promise<SupplyFlow> {
    const instruction = await this.prepareSupply(request);
    const defaultPollIntervalMs = this.options.supplyStatusPollIntervalMs;
    let trackedTxid: string | undefined;
    const getStatus = async (
      statusRequest?: SupplyFlow["getStatus"] extends (
        request?: infer T
      ) => Promise<unknown>
        ? T
        : never
    ): Promise<SupplyTrackingStatus | null> => {
      const txid = statusRequest?.txid ?? trackedTxid;
      const statusResponse = await this.getInflowStatus({
        profileId: request.profileId,
        txid,
      });

      const matchedInflow = txid
        ? (statusResponse.inflows.find((inflow) => inflow.txid === txid) ??
          null)
        : (statusResponse.inflows[0] ?? null);

      if (!matchedInflow) {
        return null;
      }

      trackedTxid = matchedInflow.txid;

      return mapBtcInflowToSupplyTrackingStatus(matchedInflow);
    };

    const flow: SupplyFlow = {
      instruction,
      target: instruction.target,
      submit: async ({ txid }) => {
        trackedTxid = txid;

        return await this.submitInflow({ txid });
      },
      getStatus,
      watchStatus: async function* (
        options?: Parameters<SupplyFlow["watchStatus"]>[0]
      ) {
        const pollIntervalMs = options?.pollIntervalMs ?? defaultPollIntervalMs;
        const signal = options?.signal;
        let nextTxid = options?.txid ?? trackedTxid;

        while (true) {
          throwIfAborted(signal);

          const currentStatus = await getStatus({ txid: nextTxid });
          if (currentStatus) {
            nextTxid = currentStatus.txid;
            trackedTxid = currentStatus.txid;

            yield {
              ...currentStatus,
            };

            if (currentStatus.isAvailable) {
              return;
            }
          }

          await delay(pollIntervalMs, signal);
        }
      },
    };

    if (request.btcWalletAdapter) {
      const autoSubmittedTxid = await this.sendAndSubmitBtcSupplyInflow({
        request,
        instruction,
      });
      trackedTxid = autoSubmittedTxid;
    }

    return flow;
  }

  private async sendAndSubmitBtcSupplyInflow(params: {
    request: SupplyFlowRequest;
    instruction: SupplyInstruction;
  }): Promise<string> {
    const { request, instruction } = params;

    if (
      instruction.target.type !== "nativeAddress" ||
      instruction.chain !== "BTC"
    ) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Wallet-executed supply is only supported for BTC native-address targets"
      );
    }

    if (!request.btcWalletAdapter?.sendBtcTransaction) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "BTC wallet adapter does not support transaction sending"
      );
    }

    const txid = await request.btcWalletAdapter.sendBtcTransaction({
      chain: "BTC",
      toAddress: instruction.target.address,
      amountSats: request.btcAmountSats,
      account: request.btcAccount,
      actionType: `supply-${request.action}`,
      transferMode: "native",
    });

    await this.submitInflowWithRetry(txid);

    return txid;
  }

  private async submitInflowWithRetry(txid: string): Promise<void> {
    await retryWithBackoff({
      execute: async () => {
        await this.submitInflow({ txid });
      },
      maxAttempts: SUBMIT_INFLOW_MAX_ATTEMPTS,
      initialRetryDelayMs: SUBMIT_INFLOW_INITIAL_RETRY_DELAY_MS,
      backoffMultiplier: SUBMIT_INFLOW_RETRY_BACKOFF_MULTIPLIER,
      shouldRetryError: isRetriableInflowNotFoundError,
    });
  }

  /**
   * Submits a BTC inflow transaction id for faster indexing.
   */
  async submitInflow(
    request: SubmitInflowRequest
  ): Promise<SubmitInflowResponse> {
    const apiClient = this.requireApi();

    return await apiClient.post<SubmitInflowResponse, SubmitInflowRequest>(
      "/v1/inflow",
      request
    );
  }

  /**
   * Returns the current inflow status for a profile, optionally filtered by txid.
   */
  async getInflowStatus(
    request: GetInflowStatusRequest
  ): Promise<GetInflowStatusResponse> {
    const apiClient = this.requireApi();
    const query = new URLSearchParams({
      profileId: request.profileId,
    });

    if (request.txid) {
      query.set("txid", request.txid);
    }

    return await apiClient.get<GetInflowStatusResponse>(
      `/v1/inflow-status?${query.toString()}`
    );
  }

  /**
   * Returns the configured deposit fee.
   */
  async getDepositFee(): Promise<bigint> {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Returns whether borrowing is currently disabled by the protocol.
   */
  async isBorrowingDisabled(): Promise<boolean> {
    try {
      return await createLendingActor(
        this.canisterContext
      ).get_borrowing_disabled();
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError(
        "get_borrowing_disabled",
        error
      );
    }
  }

  private requireApi(): ApiClient {
    if (!this.apiClient) {
      throw new LiquidiumError(
        LiquidiumErrorCode.SERVICE_UNAVAILABLE,
        "Lending API actions require an API base URL in client config"
      );
    }

    return this.apiClient;
  }

  private async waitForOutflowTxid(params: {
    profileId: string;
    poolId: string;
    amount: bigint;
    outflow: OutflowDetails;
    outflowType: UserHistoryEntry["type"];
    submittedAtMs: number;
    pollIntervalMs: number;
  }): Promise<OutflowDetails> {
    const historySearchStartMs =
      params.submittedAtMs - HISTORY_OUTFLOW_LOOKBACK_1_MINUTE_MS;

    while (true) {
      const historyItems = await this.loadRecentUserOutflowHistory({
        profileId: params.profileId,
        poolId: params.poolId,
      });

      const matchingHistoryEntry = findMatchingOutflowHistoryEntry({
        outflow: params.outflow,
        historyItems,
        outflowType: params.outflowType,
        amount: params.amount,
        historySearchStartMs,
      });

      if (matchingHistoryEntry?.status === "FAILED") {
        throw new LiquidiumError(
          LiquidiumErrorCode.TRANSFER_FAILED,
          `${params.outflowType} request failed before a txid was assigned`
        );
      }

      if (matchingHistoryEntry?.txid) {
        return {
          ...params.outflow,
          txid: matchingHistoryEntry.txid,
        };
      }

      await delay(params.pollIntervalMs);
    }
  }

  private async loadRecentUserOutflowHistory(params: {
    profileId: string;
    poolId: string;
  }): Promise<UserHistoryEntry[]> {
    const apiClient = this.requireApi();
    const query = new URLSearchParams({
      market: params.poolId,
      limit: String(HISTORY_OUTFLOW_LIMIT),
    });
    const response = await apiClient.get<UserHistoryResponse>(
      `/v1/history/users/${encodeURIComponent(params.profileId)}/transactions?${query.toString()}`
    );

    return response.items.map((item) => ({
      id: item.id,
      type: item.type,
      amount: parseBigInt(item.amount, "outflow history amount"),
      poolId: item.poolId,
      timestamp: item.timestamp,
      status: item.status,
      txid: item.txid,
      txids: item.txids,
    }));
  }

  private async getPoolById(poolId: string): Promise<LendingPoolRecord> {
    const pools = await createLendingActor(this.canisterContext).list_pools();
    const selectedPool = pools.find(
      (pool) => pool.principal.toText() === poolId
    );

    if (!selectedPool) {
      throw new LiquidiumError(
        LiquidiumErrorCode.POOL_NOT_FOUND,
        `Pool not found: ${poolId}`
      );
    }

    return selectedPool;
  }

  private async resolveSupplyTarget(
    request: SupplyRequest
  ): Promise<SupplyTarget> {
    const selectedPool = await this.getPoolById(request.poolId);

    switch (request.destination) {
      case "nativeAddress":
        return await this.getNativeAddressSupplyTarget(request.profileId, {
          poolId: request.poolId,
          asset: getVariantKey(selectedPool.asset),
          chain: getVariantKey(selectedPool.chain),
          action: request.action,
        });
      case "icrcAccount":
        return this.getIcrcAccountSupplyTarget(request.profileId, {
          poolId: request.poolId,
          asset: getVariantKey(selectedPool.asset),
          chain: getVariantKey(selectedPool.chain),
          action: request.action,
        });
    }
  }

  private async getNativeAddressSupplyTarget(
    profileId: string,
    request: SupplyTargetRequest
  ): Promise<NativeAddressSupplyTarget> {
    assertSupportsNativeAddressInflowTarget(request.asset, request.chain);

    const configuredBtcPoolId = this.canisterContext.canisterIds.btcPool;
    if (request.poolId !== configuredBtcPoolId) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Native BTC inflow targets require the configured BTC pool ${configuredBtcPoolId}, received ${request.poolId}`
      );
    }

    const subaccount = encodeInflowSubaccount({
      action: request.action,
      principal: Principal.fromText(profileId),
    });
    const address = await createCkBtcMinterActor(
      this.canisterContext
    ).get_btc_address({
      owner: [Principal.fromText(configuredBtcPoolId)],
      subaccount: [subaccount],
    });

    return {
      type: "nativeAddress",
      poolId: request.poolId,
      asset: request.asset,
      chain: request.chain,
      action: request.action,
      address,
    };
  }

  private getIcrcAccountSupplyTarget(
    profileId: string,
    request: SupplyTargetRequest
  ): IcrcAccountSupplyTarget {
    assertSupportsIcrcAccountInflowTarget(request.asset);

    const poolPrincipal = Principal.fromText(request.poolId);
    const subaccount = encodeInflowSubaccount({
      action: request.action,
      principal: Principal.fromText(profileId),
    });

    return {
      type: "icrcAccount",
      poolId: request.poolId,
      asset: request.asset,
      chain: request.chain,
      action: request.action,
      owner: poolPrincipal.toText(),
      subaccount,
      account: encodeIcrcAccount({
        owner: Principal.fromText(poolPrincipal.toText()),
        subaccount,
      }),
    };
  }
}

function findMatchingOutflowHistoryEntry(params: {
  outflow: OutflowDetails;
  historyItems: UserHistoryEntry[];
  outflowType: UserHistoryEntry["type"];
  amount: bigint;
  historySearchStartMs: number;
}): UserHistoryEntry | null {
  const matchingById = params.historyItems.find(
    (historyItem) =>
      historyItem.type === params.outflowType &&
      historyItem.id === params.outflow.id
  );

  if (matchingById) {
    return matchingById;
  }

  return (
    params.historyItems.find((historyItem) => {
      if (historyItem.type !== params.outflowType) {
        return false;
      }

      if (historyItem.amount !== params.amount) {
        return false;
      }

      const historyTimestampMs = Date.parse(historyItem.timestamp);

      if (Number.isNaN(historyTimestampMs)) {
        return false;
      }

      return historyTimestampMs >= params.historySearchStartMs;
    }) ?? null
  );
}

function mapBtcInflowToSupplyTrackingStatus(
  inflow: GetInflowStatusResponse["inflows"][number]
): SupplyTrackingStatus {
  const remainingConfirmations =
    inflow.confirmations === null
      ? inflow.requiredConfirmations
      : Math.max(inflow.requiredConfirmations - inflow.confirmations, 0);
  const estimatedMsUntilAvailable =
    remainingConfirmations * BITCOIN_BLOCK_TIME_MS;

  return {
    txid: inflow.txid,
    inflowId: inflow.inflowId,
    poolId: inflow.poolId,
    type: inflow.type,
    stage: inflow.stage,
    amountSats: inflow.amountSats,
    timestampMs: inflow.timestampMs,
    confirmations: inflow.confirmations,
    requiredConfirmations: inflow.requiredConfirmations,
    remainingConfirmations,
    isDetected: inflow.stage !== "LOGGED",
    isAvailable: inflow.stage === "CONFIRMED",
    estimatedMsUntilAvailable,
    expectedAvailableAtMs: Date.now() + estimatedMsUntilAvailable,
  };
}

async function delay(timeoutMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", abortListener);
      resolve();
    }, timeoutMs);

    function abortListener(): void {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abortListener);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    }

    signal?.addEventListener("abort", abortListener, { once: true });
  });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }
}

function isRetriableInflowNotFoundError(error: unknown): boolean {
  if (!(error instanceof LiquidiumError)) {
    return false;
  }

  if (error.code !== LiquidiumErrorCode.SERVICE_UNAVAILABLE) {
    return false;
  }

  return /not found/i.test(error.message);
}

function assertSupportsNativeAddressInflowTarget(
  asset: string,
  chain: string
): void {
  if (asset === "BTC" && chain === "BTC") {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Native address inflow targets are not supported for ${asset} on ${chain}`
  );
}

function assertSupportsIcrcAccountInflowTarget(asset: string): void {
  if (asset === "BTC" || asset === "USDT") {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `ICRC account inflow targets are not supported for ${asset}`
  );
}

function createBorrowAssetMessage(
  request: OutflowMessageRequest,
  nonce: bigint
): string {
  return `Liquidium: Borrow Assets

Action: Borrow from pool
Pool ID: ${request.pool_id}
Amount: ${request.amount}
${accountTypeToString(request.account)}
Expires: ${request.expiry_timestamp}
Nonce: ${nonce}`;
}

function createWithdrawAssetMessage(
  request: OutflowMessageRequest,
  nonce: bigint
): string {
  return `Liquidium: Withdraw Assets

Action: Withdraw from pool
Pool ID: ${request.pool_id}
Amount: ${request.amount}
${accountTypeToString(request.account)}
Expires: ${request.expiry_timestamp}
Nonce: ${nonce}`;
}

function accountTypeToString(accountType: MessageAccount): string {
  switch (accountType.type) {
    case "External":
      return `Address:${accountType.data}`;
    case "Native":
      return `Principal:${accountType.data}`;
  }
}

function mapWalletChainToLendingChain(chain: WalletChain): LendingChainVariant {
  switch (chain) {
    case "BTC":
      return { BTC: null };
    case "ETH":
      return { ETH: null };
  }
}

function mapCanisterOutflowDetails(
  outflow: CanisterOutflowRecord
): OutflowDetails {
  const rawOutflowType = getVariantKey(outflow.outflow_type);

  return {
    id: outflow.id,
    outflowType: normalizeOutflowType(rawOutflowType),
    outflowRef: outflow.outflow_ref[0],
    txid: outflow.txid[0],
    amount: outflow.amount,
    receiver: mapCanisterAccountType(outflow.receiver),
  };
}

function normalizeOutflowType(
  rawOutflowType: string
): OutflowDetails["outflowType"] {
  switch (rawOutflowType) {
    case "Withdraw":
      return "withdraw";
    case "Borrow":
      return "borrow";
    case "FeeClaim":
      return "feeClaim";
    default:
      throw new Error(`Unsupported outflow type: ${rawOutflowType}`);
  }
}

function mapCanisterAccountType(
  receiver: CanisterOutflowReceiver
): OutflowDetails["receiver"] {
  if ("Native" in receiver) {
    return {
      type: "Native",
      account: receiver.Native.toText(),
    };
  }

  return {
    type: "External",
    account: receiver.External,
  };
}
