import type { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";
import { createCkBtcMinterActor } from "../../../core/canisters/ckbtc/minter";
import { createCkEthMinterActor } from "../../../core/canisters/cketh/minter";
import {
  createLendingActor,
  type PriceRecord,
} from "../../../core/canisters/lending/actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../../core/errors";
import type { CanisterContext } from "../../../core/transports/canister-context";
import { Asset, Chain } from "../../../core/types";
import { getAssetNativeDecimals } from "../../../core/utils/asset-decimals";

const MIN_BOOSTED_WITHDRAWAL_SATS = 4_975n;

const BTC_MINTER_ROUTE_THRESHOLD_SATS = 50_000n;

const MAX_BTC_MINTER_AMOUNT_SATS = (1n << 64n) - 1n;

const RECOVERY_LEDGER_FEE_COUNT = 2n;

const ERC_NATIVE_LEDGER_FEE_COUNT = 3n;

const MIN_RECEIVED_UNITS = 1n;

const DECIMAL_BASE = 10n;

const WEI_DECIMALS = 18n;

const PRICE_QUOTE_SUFFIX = "_USDT";

interface RecoveryValidationParams {
  canisterContext: CanisterContext;
  ledger: IcrcLedgerCanister;
  ledgerCanisterId: string;
  asset: Asset;
  chain: Chain;
  amount: bigint;
}

interface UsdtPrice {
  value: bigint;
  decimals: bigint;
}

export async function validateRecoveryAmount(
  params: RecoveryValidationParams
): Promise<void> {
  if (params.amount <= 0n) {
    throw new LiquidiumError(LiquidiumErrorCode.INSUFFICIENT_FUNDS);
  }

  const ledgerFee = await params.ledger.transactionFee({ certified: false });
  const requiredAmount = await getRequiredAmount(params, ledgerFee);

  if (params.amount < requiredAmount) {
    throw new LiquidiumError(
      LiquidiumErrorCode.RECOVERY_AMOUNT_TOO_LOW,
      `Recovery requires at least ${requiredAmount} base units for this destination`
    );
  }
}

async function getRequiredAmount(
  params: RecoveryValidationParams,
  ledgerFee: bigint
): Promise<bigint> {
  if (params.asset === Asset.ICP) {
    return ledgerFee + MIN_RECEIVED_UNITS;
  }

  switch (params.chain) {
    case Chain.BTC:
      return getRequiredBtcAmount(params, ledgerFee);
    case Chain.ETH:
      return params.asset === Asset.ETH
        ? getRequiredEthAmount(params, ledgerFee)
        : getRequiredErcAmount(params, ledgerFee);
    default:
      return ledgerFee * RECOVERY_LEDGER_FEE_COUNT + MIN_RECEIVED_UNITS;
  }
}

async function getRequiredBtcAmount(
  params: RecoveryValidationParams,
  ledgerFee: bigint
): Promise<bigint> {
  const intermediateFees = ledgerFee * RECOVERY_LEDGER_FEE_COUNT;
  const outflowBalance = params.amount - ledgerFee;

  if (outflowBalance < BTC_MINTER_ROUTE_THRESHOLD_SATS + ledgerFee) {
    return MIN_BOOSTED_WITHDRAWAL_SATS + intermediateFees + MIN_RECEIVED_UNITS;
  }

  if (outflowBalance > MAX_BTC_MINTER_AMOUNT_SATS) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Recovery amount exceeds the BTC minter limit"
    );
  }

  const minter = createCkBtcMinterActor(params.canisterContext);

  const [info, estimate] = await Promise.all([
    minter.get_minter_info(),
    minter.estimate_withdrawal_fee({
      amount: [params.amount - intermediateFees],
    }),
  ]);

  return (
    intermediateFees +
    maxBigint(
      info.retrieve_btc_min_amount,
      estimate.bitcoin_fee + estimate.minter_fee + MIN_RECEIVED_UNITS
    )
  );
}

async function getRequiredEthAmount(
  params: RecoveryValidationParams,
  ledgerFee: bigint
): Promise<bigint> {
  const minter = createCkEthMinterActor(params.canisterContext);

  const [info, price] = await Promise.all([
    minter.get_minter_info(),
    minter.eip_1559_transaction_price([]),
  ]);

  const [minimumWithdrawal] = info.minimum_withdrawal_amount;

  if (minimumWithdrawal === undefined) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "The ETH minter did not return its withdrawal minimum"
    );
  }

  return (
    ledgerFee * RECOVERY_LEDGER_FEE_COUNT +
    maxBigint(minimumWithdrawal, price.max_transaction_fee + MIN_RECEIVED_UNITS)
  );
}

async function getRequiredErcAmount(
  params: RecoveryValidationParams,
  ledgerFee: bigint
): Promise<bigint> {
  const [transactionPrice, prices] = await Promise.all([
    createCkEthMinterActor(params.canisterContext).eip_1559_transaction_price([
      { ckerc20_ledger_id: Principal.fromText(params.ledgerCanisterId) },
    ]),
    createLendingActor(params.canisterContext).get_prices(),
  ]);

  const ethPrice = getUsdtPrice(prices, Asset.ETH);
  const tokenPrice = getUsdtPrice(prices, params.asset);
  const tokenDecimals = getAssetNativeDecimals(params.asset);

  // The minter quotes the ckERC20 gas limit, which exceeds the pool's burn gas
  // limit. The surplus absorbs drift between this price and the pool's cache.
  const burnFee = ceilDiv(
    transactionPrice.max_transaction_fee *
      ethPrice.value *
      DECIMAL_BASE ** (tokenPrice.decimals + tokenDecimals),
    tokenPrice.value * DECIMAL_BASE ** (ethPrice.decimals + WEI_DECIMALS)
  );

  return ledgerFee * ERC_NATIVE_LEDGER_FEE_COUNT + burnFee + MIN_RECEIVED_UNITS;
}

function getUsdtPrice(prices: PriceRecord[], asset: Asset): UsdtPrice {
  const pair = `${asset}${PRICE_QUOTE_SUFFIX}`;
  const record = prices.find(([name]) => name === pair);

  if (!record || record[1] <= 0n) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      `Protocol price ${pair} is unavailable for the recovery fee check`
    );
  }

  return { value: record[1], decimals: BigInt(record[2]) };
}

function ceilDiv(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator - 1n) / denominator;
}

function maxBigint(left: bigint, right: bigint): bigint {
  return left > right ? left : right;
}
