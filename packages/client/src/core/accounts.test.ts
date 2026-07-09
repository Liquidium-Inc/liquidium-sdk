import { Principal } from "@icp-sdk/core/principal";
import { describe, expect, test } from "vitest";
import {
  createIcrcAccount,
  mapCanisterAccountToLiquidiumAccount,
} from "./accounts";

describe("mapCanisterAccountToLiquidiumAccount", () => {
  test("uses address consistently for every account variant", () => {
    const principal = Principal.fromText("aaaaa-aa");
    const icrcAccount = createIcrcAccount({ owner: principal });

    expect(
      mapCanisterAccountToLiquidiumAccount({ External: "bc1qexample" })
    ).toEqual({
      type: "ChainAddress",
      address: "bc1qexample",
    });
    expect(mapCanisterAccountToLiquidiumAccount({ Native: principal })).toEqual(
      {
        type: "IcPrincipal",
        address: "aaaaa-aa",
      }
    );
    expect(
      mapCanisterAccountToLiquidiumAccount({ AccountIdentifier: "account-id" })
    ).toEqual({
      type: "IcpAccountIdentifier",
      address: "account-id",
    });
    expect(
      mapCanisterAccountToLiquidiumAccount({
        Icrc: { owner: principal, subaccount: [] },
      })
    ).toEqual(icrcAccount);
  });
});
