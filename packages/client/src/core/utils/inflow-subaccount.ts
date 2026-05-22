import type { Principal } from "@icp-sdk/core/principal";
import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import { SupplyAction } from "../types";

const INFLOW_DEPOSIT_PREFIX = 0x1;
const INFLOW_REPAY_PREFIX = 0x2;
const MAX_PRINCIPAL_BYTES = 29;
const SUBACCOUNT_LENGTH = 32;
const PRINCIPAL_LENGTH_OFFSET = 2;
const PRINCIPAL_START_OFFSET = 3;

export function encodeInflowSubaccount(request: {
  action: SupplyAction;
  principal: Principal;
}): Uint8Array {
  const subaccount = new Uint8Array(SUBACCOUNT_LENGTH);
  const principalBytes = request.principal.toUint8Array();

  if (principalBytes.length > MAX_PRINCIPAL_BYTES) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Principal length exceeds inflow subaccount capacity"
    );
  }

  subaccount[0] =
    request.action === SupplyAction.deposit
      ? INFLOW_DEPOSIT_PREFIX
      : INFLOW_REPAY_PREFIX;
  subaccount[PRINCIPAL_LENGTH_OFFSET] = principalBytes.length;
  subaccount.set(principalBytes, PRINCIPAL_START_OFFSET);

  return subaccount;
}
