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
import type { InflowType } from "../../core/types";
import { encodeInflowSubaccount } from "../../core/utils/inflow-subaccount";
import type {
  IcrcAccountInflowTarget,
  InflowTarget,
  NativeAddressInflowTarget,
  OutflowDetails,
  SupplyInstruction,
  SupplyRequest,
} from "./types";
import { InflowDestinationType } from "./types";

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
    const inflowTarget = await this.resolveInflowTarget(request);

    return {
      poolId: request.poolId,
      asset: inflowTarget.asset,
      chain: inflowTarget.chain,
      inflowType: request.inflowType,
      target: inflowTarget,
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

  private async resolveInflowTarget(
    request: SupplyRequest
  ): Promise<InflowTarget> {
    const selectedPool = await this.getPoolById(request.poolId);
    const destinationType = request.destinationType ?? request.targetType;

    switch (destinationType) {
      case InflowDestinationType.NATIVE_ADDRESS:
        return await this.getNativeAddressInflowTarget(request.profileId, {
          poolId: request.poolId,
          asset: getVariantKey(selectedPool.asset),
          chain: getVariantKey(selectedPool.chain),
          inflowType: request.inflowType,
        });
      case InflowDestinationType.ICRC_ACCOUNT:
        return this.getIcrcAccountInflowTarget(request.profileId, {
          poolId: request.poolId,
          asset: getVariantKey(selectedPool.asset),
          chain: getVariantKey(selectedPool.chain),
          inflowType: request.inflowType,
        });
    }
  }

  private async getNativeAddressInflowTarget(
    profileId: string,
    request: {
      poolId: string;
      asset: string;
      chain: string;
      inflowType: InflowType;
    }
  ): Promise<NativeAddressInflowTarget> {
    assertSupportsNativeAddressInflowTarget(request.asset, request.chain);

    const subaccount = encodeInflowSubaccount({
      inflowType: request.inflowType,
      principal: Principal.fromText(profileId),
    });
    const address = await createCkBtcMinterActor(
      this.canisterContext
    ).get_btc_address({
      owner: [Principal.fromText(request.poolId)],
      subaccount: [subaccount],
    });

    return {
      type: InflowDestinationType.NATIVE_ADDRESS,
      poolId: request.poolId,
      asset: request.asset,
      chain: request.chain,
      inflowType: request.inflowType,
      address,
    };
  }

  private getIcrcAccountInflowTarget(
    profileId: string,
    request: {
      poolId: string;
      asset: string;
      chain: string;
      inflowType: InflowType;
    }
  ): IcrcAccountInflowTarget {
    assertSupportsIcrcAccountInflowTarget(request.asset);

    const poolPrincipal = Principal.fromText(request.poolId);
    const subaccount = encodeInflowSubaccount({
      inflowType: request.inflowType,
      principal: Principal.fromText(profileId),
    });

    return {
      type: InflowDestinationType.ICRC_ACCOUNT,
      poolId: request.poolId,
      asset: request.asset,
      chain: request.chain,
      inflowType: request.inflowType,
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
