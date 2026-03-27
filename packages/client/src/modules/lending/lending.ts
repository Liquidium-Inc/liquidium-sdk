import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { Principal as IcpSdkPrincipal } from "@icp-sdk/core/principal";
import { createCkBtcMinterActor } from "../../core/canisters/ckbtc/minter";
import {
  createLendingActor,
  type LendingPoolRecord,
} from "../../core/canisters/lending/actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { SupplyAction } from "../../core/types";
import { encodeInflowSubaccount } from "../../core/utils/inflow-subaccount";
import type {
  IcrcAccountSupplyTarget,
  NativeAddressSupplyTarget,
  OutflowDetails,
  SupplyInstruction,
  SupplyRequest,
  SupplyTarget,
} from "./types";

export class LendingModule {
  constructor(readonly canisterContext: CanisterContext) {}

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

  async getBtcDepositFee(): Promise<bigint> {
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

    const subaccount = encodeInflowSubaccount({
      action: request.action,
      principal: Principal.fromText(profileId),
    });
    const address = await createCkBtcMinterActor(
      this.canisterContext
    ).get_btc_address({
      owner: [Principal.fromText(request.poolId)],
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
