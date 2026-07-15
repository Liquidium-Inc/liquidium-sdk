import { Principal } from "@icp-sdk/core/principal";
import {
  createIcrcAccount,
  encodeIcpAccountIdentifier,
} from "../../../core/accounts";
import { normalizeAndValidateEvmAddress } from "../../../core/address-validation";
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
import type { CanisterContext } from "../../../core/transports/canister-context";
import {
  Asset,
  type AssetIdentifier,
  Chain,
  type SupplyAction,
} from "../../../core/types";
import { encodeInflowSubaccount } from "../../../core/utils/inflow-subaccount";
import { SupplyPlanType, type SupplyTarget } from "../types";

export interface ResolveSupplyTargetRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  mechanism: SupplyPlanType | null;
  chain?: Chain;
}

type SupplyTargetRequest = AssetIdentifier & {
  poolId: string;
  action: SupplyAction;
};

interface ResolveSupplyMechanismParams {
  identifier: AssetIdentifier;
  mechanism: SupplyPlanType | null;
}

export async function resolveSupplyTargetForPool(
  canisterContext: CanisterContext,
  request: ResolveSupplyTargetRequest,
  selectedPool: DecodedPool
): Promise<SupplyTarget> {
  const identifier = resolveSupplyAssetIdentifier({
    asset: selectedPool.asset,
    poolChain: selectedPool.chain,
    transferChain: request.chain ?? selectedPool.chain,
  });
  const mechanism = resolveSupplyMechanism({
    identifier,
    mechanism: request.mechanism,
  });
  const targetRequest: SupplyTargetRequest = {
    ...identifier,
    poolId: request.poolId,
    action: request.action,
  };

  if (mechanism === SupplyPlanType.contractInteraction) {
    return getIcrcAccountSupplyTarget(request.profileId, targetRequest);
  }

  if (identifier.chain === Chain.ICP) {
    return identifier.asset === Asset.ICP
      ? getIcpLedgerSupplyTarget(request.profileId, targetRequest)
      : getIcrcAccountSupplyTarget(request.profileId, targetRequest);
  }

  return await getChainAddressSupplyTarget(
    canisterContext,
    request.profileId,
    targetRequest
  );
}

function resolveSupplyMechanism(
  params: ResolveSupplyMechanismParams
): SupplyPlanType {
  if (params.mechanism !== SupplyPlanType.contractInteraction) {
    return SupplyPlanType.transfer;
  }

  if (
    params.identifier.chain === Chain.ETH &&
    (params.identifier.asset === Asset.USDC ||
      params.identifier.asset === Asset.USDT)
  ) {
    return SupplyPlanType.contractInteraction;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Contract-interaction supply is not supported for ${params.identifier.asset} on ${params.identifier.chain}`
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

export function getEthDepositTokenAddress(asset: string): [] | [string] {
  if (asset === Asset.ETH) {
    return [];
  }

  return [getEthStablecoinContractAddress(asset)];
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

export async function getPoolById(
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

interface ResolveSupplyAssetIdentifierParams {
  asset: string;
  poolChain: string;
  transferChain: string;
}

function resolveSupplyAssetIdentifier(
  params: ResolveSupplyAssetIdentifierParams
): AssetIdentifier {
  if (params.asset === Asset.BTC && params.poolChain === Chain.BTC) {
    if (params.transferChain === Chain.BTC) {
      return { asset: Asset.BTC, chain: Chain.BTC };
    }

    if (params.transferChain === Chain.ICP) {
      return { asset: Asset.BTC, chain: Chain.ICP };
    }
  }

  if (
    (params.asset === Asset.ETH ||
      params.asset === Asset.USDC ||
      params.asset === Asset.USDT) &&
    params.poolChain === Chain.ETH
  ) {
    if (params.transferChain === Chain.ETH) {
      return { asset: params.asset, chain: Chain.ETH };
    }

    if (params.transferChain === Chain.ICP) {
      return { asset: params.asset, chain: Chain.ICP };
    }
  }

  if (
    params.asset === Asset.ICP &&
    params.poolChain === Chain.ICP &&
    params.transferChain === Chain.ICP
  ) {
    return { asset: Asset.ICP, chain: Chain.ICP };
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Supply is not supported for ${params.asset} pool on ${params.poolChain} using ${params.transferChain}`
  );
}

async function getChainAddressSupplyTarget(
  canisterContext: CanisterContext,
  profileId: string,
  request: SupplyTargetRequest
): Promise<SupplyTarget> {
  if (request.chain === Chain.ETH) {
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
      getEthDepositTokenAddress(request.asset)
    );

    if ("Err" in result) {
      throw mapDepositAccountErrorToLiquidiumError(result.Err);
    }

    const address = normalizeAndValidateEvmAddress(
      result.Ok,
      "Deposit address canister returned an invalid EVM address"
    );

    return {
      poolId: request.poolId,
      asset: request.asset,
      chain: request.chain,
      action: request.action,
      address,
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

  return { ...request, address };
}

function getIcrcAccountSupplyTarget(
  profileId: string,
  request: SupplyTargetRequest
): SupplyTarget {
  const account = createInflowIcrcAccount(profileId, request);

  return { ...request, address: account.address };
}

function getIcpLedgerSupplyTarget(
  profileId: string,
  request: SupplyTargetRequest
): SupplyTarget {
  const poolPrincipal = Principal.fromText(request.poolId);
  const subaccount = encodeInflowSubaccount({
    action: request.action,
    principal: Principal.fromText(profileId),
  });
  const account = createIcrcAccount({
    owner: poolPrincipal,
    subaccount,
  });

  return {
    poolId: request.poolId,
    asset: Asset.ICP,
    chain: Chain.ICP,
    action: request.action,
    address: account.address,
    icpAccountIdentifier: encodeIcpAccountIdentifier({
      owner: poolPrincipal,
      subaccount,
    }),
  };
}

function createInflowIcrcAccount(
  profileId: string,
  request: SupplyTargetRequest
) {
  return createIcrcAccount({
    owner: Principal.fromText(request.poolId),
    subaccount: encodeInflowSubaccount({
      action: request.action,
      principal: Principal.fromText(profileId),
    }),
  });
}
