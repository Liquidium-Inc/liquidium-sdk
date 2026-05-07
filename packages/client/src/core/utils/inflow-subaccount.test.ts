import { Principal } from "@dfinity/principal";
import { describe, expect, test } from "vitest";
import { SupplyAction } from "../types";
import { encodeInflowSubaccount } from "./inflow-subaccount";

const INFLOW_DEPOSIT_PREFIX = 0x1;
const INFLOW_REPAY_PREFIX = 0x2;
const PRINCIPAL_LENGTH_OFFSET = 2;
const PRINCIPAL_START_OFFSET = 3;
const SUBACCOUNT_LENGTH = 32;

describe("encodeInflowSubaccount", () => {
  test("should encode deposit and repayment actions with distinct prefixes", () => {
    // given
    const principal = Principal.fromText(
      "pimqm-2dtug-w3ejt-krqai-jlp3u-uux2y-erjcw-wbvhu-pmvhu-hunju-wqe"
    );
    const principalBytes = principal.toUint8Array();

    // when
    const depositSubaccount = encodeInflowSubaccount({
      action: SupplyAction.deposit,
      principal,
    });
    const repaymentSubaccount = encodeInflowSubaccount({
      action: SupplyAction.repayment,
      principal,
    });

    // then
    expect(depositSubaccount).toHaveLength(SUBACCOUNT_LENGTH);
    expect(repaymentSubaccount).toHaveLength(SUBACCOUNT_LENGTH);
    expect(depositSubaccount[0]).toBe(INFLOW_DEPOSIT_PREFIX);
    expect(repaymentSubaccount[0]).toBe(INFLOW_REPAY_PREFIX);
    expect(depositSubaccount[PRINCIPAL_LENGTH_OFFSET]).toBe(
      principalBytes.length
    );
    expect(repaymentSubaccount[PRINCIPAL_LENGTH_OFFSET]).toBe(
      principalBytes.length
    );
    expect(
      Array.from(
        depositSubaccount.slice(
          PRINCIPAL_START_OFFSET,
          PRINCIPAL_START_OFFSET + principalBytes.length
        )
      )
    ).toEqual(Array.from(principalBytes));
    expect(
      Array.from(
        repaymentSubaccount.slice(
          PRINCIPAL_START_OFFSET,
          PRINCIPAL_START_OFFSET + principalBytes.length
        )
      )
    ).toEqual(Array.from(principalBytes));
  });
});
