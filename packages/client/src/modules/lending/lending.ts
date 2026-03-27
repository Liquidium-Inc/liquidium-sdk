import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { InternalProvider } from "../../core/transports/provider";
import type { Inflowtype } from "../../core/types";
import type {
  BtcDepositAddresses,
  CkInflowAccount,
  OutflowDetails,
} from "./types";

export class LendingModule {
  constructor(readonly provider: InternalProvider) {}

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

  async getBtcDepositAddresses(
    profileId: string
  ): Promise<BtcDepositAddresses> {
    void profileId;
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  getCkInflowAccount(
    profileId: string,
    asset: "BTC" | "USDT",
    inflowType: Inflowtype
  ): CkInflowAccount {
    void profileId;
    void asset;
    void inflowType;
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
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
}
