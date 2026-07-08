import { Principal } from "@icp-sdk/core/principal";
import {
  createIcrcAccount,
  encodeIcpAccountIdentifier,
} from "../../../core/accounts";
import { createCkBtcMinterActor } from "../../../core/canisters/ckbtc/minter";
import {
  createDepositAccountsActor,
  type DepositAccountErrors,
} from "../../../core/canisters/deposit-accounts/actor";
import {
  createFlexibleLendingActor,
  type DecodedPool,
  decodeFlexiblePool,
} from "../../../core/canisters/lending/flexible-actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../../core/errors";
import {
  USDC_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
} from "../../../core/evm";
import { isPoolLedgerAsset } from "../../../core/pool-ledger-assets";
import type { CanisterContext } from "../../../core/transports/canister-context";
import { Asset, Chain, type SupplyAction } from "../../../core/types";
import { encodeInflowSubaccount } from "../../../core/utils/inflow-subaccount";
import {
  type ChainAddressSupplyTarget,
  type IcpLedgerAccountSupplyTarget,
  type IcrcAccountSupplyTarget,
  SupplyPlanType,
  type SupplyTarget,
} from "../types";

export interface ResolveSupplyTargetRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  mechanism: SupplyPlanType | null;
  chain?: Chain;
}

interface SupplyTargetRequest {
  poolId: string;
  asset: string;
  chain: string;
  action: SupplyAction;
}

interface ResolveSupplyMechanismParams {
  asset: string;
  poolChain: string;
  transferChain: string;
  mechanism: SupplyPlanType | null;
}

export async function resolveSupplyTarget(
  canisterContext: CanisterContext,
  request: ResolveSupplyTargetRequest
): Promise<SupplyTarget> {
  const selectedPool = await getPoolById(canisterContext, request.poolId);
  const asset = selectedPool.asset;
  const poolChain = selectedPool.chain;
  const transferChain = request.chain ?? poolChain;
  const mechanism = resolveSupplyMechanism({
    asset,
    poolChain,
    transferChain,
    mechanism: request.mechanism,
  });

  switch (mechanism) {
    case SupplyPlanType.transfer:
      if (asset === Asset.ICP && transferChain === Chain.ICP) {
        return getIcpLedgerAccountSupplyTarget(request.profileId, {
          poolId: request.poolId,
          asset,
          chain: transferChain,
          action: request.action,
        });
      }

      if (transferChain === Chain.ICP) {
        return getIcrcAccountSupplyTarget(request.profileId, {
          poolId: request.poolId,
          asset,
          chain: transferChain,
          action: request.action,
        });
      }

      return await getChainAddressSupplyTarget(
        canisterContext,
        request.profileId,
        {
          poolId: request.poolId,
          asset,
          chain: poolChain,
          action: request.action,
        }
      );
    case SupplyPlanType.contractInteraction:
      return getIcrcAccountSupplyTarget(request.profileId, {
        poolId: request.poolId,
        asset,
        chain: transferChain,
        action: request.action,
      });
  }
}

export function resolveSupplyMechanism(
  params: ResolveSupplyMechanismParams
): SupplyPlanType {
  if (params.transferChain === Chain.ICP && params.asset !== Asset.ICP) {
    if (params.mechanism === SupplyPlanType.contractInteraction) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "ICP-chain supply is not supported for contract-interaction supply"
      );
    }

    return SupplyPlanType.transfer;
  }

  if (params.asset === Asset.BTC && params.poolChain === Chain.BTC) {
    if (params.mechanism === SupplyPlanType.contractInteraction) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply is not supported for BTC on BTC"
      );
    }

    return SupplyPlanType.transfer;
  }

  if (isEthStablecoin(params.asset, params.poolChain)) {
    if (params.mechanism) {
      return params.mechanism;
    }

    return SupplyPlanType.transfer;
  }

  if (params.asset === Asset.ICP && params.poolChain === Chain.ICP) {
    if (params.mechanism === SupplyPlanType.contractInteraction) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply is not supported for ICP on ICP"
      );
    }

    return SupplyPlanType.transfer;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `No supply mechanism is configured for ${params.asset} on ${params.transferChain}`
  );
}

export function isEthStablecoin(asset: string, chain: string): boolean {
  return chain === Chain.ETH && (asset === Asset.USDC || asset === Asset.USDT);
}

export function getEthStablecoinContractAddress(asset: string): string {
  if (asset === Asset.USDC) {
    return USDC_CONTRACT_ADDRESS;
  }

  if (asset === Asset.USDT) {
    return USDT_CONTRACT_ADDRESS;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `ETH stablecoin contract address is not configured for ${asset}`
  );
}

export function mapDepositAccountErrorToLiquidiumError(
  error: DepositAccountErrors
): LiquidiumError {
  if ("InvalidEvmAddress" in error) {
    return new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      "Invalid EVM deposit address"
    );
  }

  if ("Busy" in error) {
    return new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "Deposit address service is busy"
    );
  }

  if ("Cooldown" in error) {
    return new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      `Deposit address service is cooling down for ${error.Cooldown.retry_after_secs.toString()} seconds`
    );
  }

  if ("Other" in error) {
    return new LiquidiumError(
      LiquidiumErrorCode.DEPOSIT_ADDRESS_ERROR,
      error.Other
    );
  }

  if ("AddressDerivationFailed" in error) {
    return new LiquidiumError(
      LiquidiumErrorCode.DEPOSIT_ADDRESS_ERROR,
      "Deposit address derivation failed"
    );
  }

  if ("NotFound" in error) {
    return new LiquidiumError(
      LiquidiumErrorCode.DEPOSIT_ADDRESS_ERROR,
      "Deposit address not found"
    );
  }

  return new LiquidiumError(
    LiquidiumErrorCode.DEPOSIT_ADDRESS_ERROR,
    "Deposit address canister returned an unknown error"
  );
}

async function getPoolById(
  canisterContext: CanisterContext,
  poolId: string
): Promise<DecodedPool> {
  const pools = await createFlexibleLendingActor(canisterContext).list_pools();
  const selectedPool = pools.find((pool) => pool.principal.toText() === poolId);

  const decodedPool = selectedPool ? decodeFlexiblePool(selectedPool) : null;
  if (!decodedPool) {
    throw new LiquidiumError(
      LiquidiumErrorCode.POOL_NOT_FOUND,
      `Pool not found: ${poolId}`
    );
  }

  return decodedPool;
}

async function getChainAddressSupplyTarget(
  canisterContext: CanisterContext,
  profileId: string,
  request: SupplyTargetRequest
): Promise<ChainAddressSupplyTarget> {
  assertSupportsChainAddressInflowTarget(request.asset, request.chain);

  if (isEthStablecoin(request.asset, request.chain)) {
    const tokenAddress = getEthStablecoinContractAddress(request.asset);
    const subaccount = encodeInflowSubaccount({
      action: request.action,
      principal: Principal.fromText(profileId),
    });
    const result = await createDepositAccountsActor(
      canisterContext
    ).get_deposit_address(
      {
        owner: Principal.fromText(request.poolId),
        subaccount: [subaccount],
      },
      [tokenAddress]
    );

    if ("Err" in result) {
      throw mapDepositAccountErrorToLiquidiumError(result.Err);
    }

    return {
      type: "ChainAddress",
      poolId: request.poolId,
      asset: request.asset,
      chain: request.chain,
      action: request.action,
      address: result.Ok,
    };
  }

  const configuredBtcPoolId = canisterContext.canisterIds.pools.btc;
  if (request.poolId !== configuredBtcPoolId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Chain-address BTC inflow targets require the configured BTC pool ${configuredBtcPoolId}, received ${request.poolId}`
    );
  }

  const subaccount = encodeInflowSubaccount({
    action: request.action,
    principal: Principal.fromText(profileId),
  });
  const address = await createCkBtcMinterActor(canisterContext).get_btc_address(
    {
      owner: [Principal.fromText(configuredBtcPoolId)],
      subaccount: [subaccount],
    }
  );

  return {
    type: "ChainAddress",
    poolId: request.poolId,
    asset: request.asset,
    chain: request.chain,
    action: request.action,
    address,
  };
}

function getIcrcAccountSupplyTarget(
  profileId: string,
  request: SupplyTargetRequest
): IcrcAccountSupplyTarget {
  assertSupportsIcrcAccountInflowTarget(request.asset, request.chain);

  const poolPrincipal = Principal.fromText(request.poolId);
  const subaccount = encodeInflowSubaccount({
    action: request.action,
    principal: Principal.fromText(profileId),
  });

  return {
    type: "IcrcAccount",
    poolId: request.poolId,
    asset: request.asset,
    chain: request.chain,
    action: request.action,
    account: createIcrcAccount({
      owner: poolPrincipal,
      subaccount,
    }),
  };
}

function getIcpLedgerAccountSupplyTarget(
  profileId: string,
  request: SupplyTargetRequest
): IcpLedgerAccountSupplyTarget {
  if (request.asset !== Asset.ICP || request.chain !== Chain.ICP) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `ICP ledger inflow targets are not supported for ${request.asset} on ${request.chain}`
    );
  }

  const poolPrincipal = Principal.fromText(request.poolId);
  const subaccount = encodeInflowSubaccount({
    action: request.action,
    principal: Principal.fromText(profileId),
  });
  const icrcAccount = createIcrcAccount({
    owner: poolPrincipal,
    subaccount,
  });

  return {
    type: "IcpLedgerAccount",
    poolId: request.poolId,
    asset: Asset.ICP,
    chain: Chain.ICP,
    action: request.action,
    account: {
      icpIcrcAccount: icrcAccount,
      icpAccountIdentifier: encodeIcpAccountIdentifier({
        owner: poolPrincipal,
        subaccount,
      }),
    },
  };
}

function assertSupportsChainAddressInflowTarget(
  asset: string,
  chain: string
): void {
  if (asset === Asset.BTC && chain === Chain.BTC) {
    return;
  }

  if (isEthStablecoin(asset, chain)) {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Chain address inflow targets are not supported for ${asset} on ${chain}`
  );
}

function assertSupportsIcrcAccountInflowTarget(
  asset: string,
  chain: string
): void {
  if (asset !== Asset.ICP && isPoolLedgerAsset({ asset, chain })) {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `ICRC account inflow targets are not supported for ${asset} on ${chain}`
  );
}
