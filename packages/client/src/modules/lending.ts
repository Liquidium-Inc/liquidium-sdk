import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import type { InternalProvider } from "../internal/provider";
import type {
  BtcDepositAddresses,
  CkInflowAccount,
  Inflowtype,
  OutflowDetails,
} from "../types";

/**
 * Supply, borrow, repay, and withdraw operations.
 *
 * All methods route through the canister.
 */
export class LendingModule {
  /** @internal */
  constructor(readonly provider: InternalProvider) {}

  /**
   * Withdraw assets from a pool.
   */
  async withdraw(request: {
    profileId: string;
    poolId: string;
    amount: bigint;
    account: string;
  }): Promise<OutflowDetails> {
    void request;
    // TODO: wire to canister via LendingPool.withdraw
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Borrow assets from a pool.
   */
  async borrow(request: {
    profileId: string;
    poolId: string;
    amount: bigint;
    account: string;
  }): Promise<OutflowDetails> {
    void request;
    // TODO: wire to canister via LendingPool.borrow_assets
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get Bitcoin deposit addresses for a profile (deposit + repayment).
   */
  async getBtcDepositAddresses(
    profileId: string
  ): Promise<BtcDepositAddresses> {
    void profileId;
    // TODO: wire to canister via LendingPool.get_btc_deposit_address
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get the ICRC inflow account for ckBTC or ckUSDT deposits/repayments.
   */
  getCkInflowAccount(
    profileId: string,
    asset: "BTC" | "USDT",
    inflowType: Inflowtype
  ): CkInflowAccount {
    void profileId;
    void asset;
    void inflowType;
    // TODO: wire to canister via LendingPool.get_ck_inflow_account
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get the total deposit fee for BTC (minter + ledger fees).
   */
  async getBtcDepositFee(): Promise<bigint> {
    // TODO: wire to canister via LendingPool.btc_deposit_fee
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Check whether borrowing is currently disabled globally.
   */
  async isBorrowingDisabled(): Promise<boolean> {
    // TODO: wire to canister via LendingPool.get_borrowing_disabled
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }
}
