import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { Principal as IcpSdkPrincipal } from "@icp-sdk/core/principal";
import { createCkBtcMinterActor } from "../../core/canisters/ckbtc/minter";
import {
  createLendingActor,
  type LendingPoolRecord,
} from "../../core/canisters/lending/actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { SupplyAction } from "../../core/types";
import { encodeInflowSubaccount } from "../../core/utils/inflow-subaccount";
import type {
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
} from "./types";

const BITCOIN_BLOCK_TIME_MS = 10 * 60 * 1000;

type LendingModuleOptions = {
  supplyStatusPollIntervalMs: number;
};

export class LendingModule {
  constructor(
    readonly canisterContext: CanisterContext,
    readonly apiClient: ApiClient | undefined,
    readonly options: LendingModuleOptions
  ) {}

  async withdraw(request: {
    profileId: string;
    poolId: string;
    amount: bigint;
    account: string;
  }): Promise<OutflowDetails> {
    void request;
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  async borrow(request: {
    profileId: string;
    poolId: string;
    amount: bigint;
    account: string;
  }): Promise<OutflowDetails> {
    void request;
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  async supply(request: SupplyRequest): Promise<SupplyInstruction> {
    const supplyTarget = await this.resolveSupplyTarget(request);

    return {
      poolId: request.poolId,
      asset: supplyTarget.asset,
      chain: supplyTarget.chain,
      action: request.action,
      target: supplyTarget,
    };
  }

  async createSupplyFlow(request: SupplyFlowRequest): Promise<SupplyFlow> {
    const instruction = await this.supply(request);
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

    return {
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
  }

  async submitInflow(
    request: SubmitInflowRequest
  ): Promise<SubmitInflowResponse> {
    const apiClient = this.requireApi();

    return await apiClient.post<SubmitInflowResponse, SubmitInflowRequest>(
      "/v1/inflow",
      request
    );
  }

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

  async getDepositFee(): Promise<bigint> {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  async isBorrowingDisabled(): Promise<boolean> {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
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
    request: {
      poolId: string;
      asset: string;
      chain: string;
      action: SupplyAction;
    }
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
    request: {
      poolId: string;
      asset: string;
      chain: string;
      action: SupplyAction;
    }
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
        owner: IcpSdkPrincipal.fromText(poolPrincipal.toText()),
        subaccount,
      }),
    };
  }
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

function getVariantKey(variant: Record<string, null>): string {
  const [variantKey] = Object.keys(variant);

  if (!variantKey) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Unexpected empty canister variant"
    );
  }

  return variantKey;
}
