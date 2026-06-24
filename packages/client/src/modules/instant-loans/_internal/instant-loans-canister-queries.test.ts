import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LiquidiumClient } from "../../../index";
import { createLoanCreatedEvent, LOAN_ID, PROFILE_ID } from "./test-fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("InstantLoansModule canister queries", () => {
  test("calls public instant-loan query methods directly on the canister", async () => {
    // given
    const getConfig = vi.fn().mockResolvedValue({
      lending_canister: Principal.fromText("aaaaa-aa"),
    });
    const getEvent = vi.fn().mockResolvedValue([createLoanCreatedEvent()]);
    const listEvents = vi
      .fn()
      .mockResolvedValue([[1n, createLoanCreatedEvent()]]);
    const listAccessList = vi
      .fn()
      .mockResolvedValue([Principal.fromText("aaaaa-aa")]);
    const countWarmedProfiles = vi.fn().mockResolvedValue(2n);
    const listWarmedProfiles = vi.fn().mockResolvedValue([
      {
        id: 7n,
        authorisation: {
          EthSignature: {
            derivation_index: new Uint8Array([1]),
            pubkey: new Uint8Array([2]),
            address: "0x1111111111111111111111111111111111111111",
          },
        },
        created_at: 123n,
        lending_profile: Principal.fromText(PROFILE_ID),
      },
    ]);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      count_warmed_profiles: countWarmedProfiles,
      get_config: getConfig,
      get_event: getEvent,
      list_access_list: listAccessList,
      list_events: listEvents,
      list_warmed_profiles: listWarmedProfiles,
    } as never);
    const client = new LiquidiumClient({
      canisterIds: { instantLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const config = await client.instantLoans.getConfig();
    const event = await client.instantLoans.getEvent(1n);
    const events = await client.instantLoans.listEvents({
      start: 1n,
      limit: 10n,
    });
    const accessList = await client.instantLoans.listAccessList();
    const warmedProfileCount = await client.instantLoans.countWarmedProfiles();
    const warmedProfiles = await client.instantLoans.listWarmedProfiles();

    // then
    expect(getConfig).toHaveBeenCalledWith();
    expect(getEvent).toHaveBeenCalledWith(1n);
    expect(listEvents).toHaveBeenCalledWith(1n, 10n);
    expect(listAccessList).toHaveBeenCalledWith();
    expect(countWarmedProfiles).toHaveBeenCalledWith();
    expect(listWarmedProfiles).toHaveBeenCalledWith();
    expect(config).toEqual({ lendingCanisterId: "aaaaa-aa" });
    expect(event).toMatchObject({
      id: 1n,
      eventType: {
        type: "LoanCreated",
        loanId: LOAN_ID,
        collateralAsset: "BTC",
        borrowAsset: "USDT",
      },
    });
    expect(events).toHaveLength(1);
    expect(accessList).toEqual(["aaaaa-aa"]);
    expect(warmedProfileCount).toBe(2n);
    expect(warmedProfiles).toEqual([
      {
        id: 7n,
        authorization: {
          type: "EthSignature",
          derivationIndex: new Uint8Array([1]),
          publicKey: new Uint8Array([2]),
          address: "0x1111111111111111111111111111111111111111",
        },
        createdAt: 123n,
        profileId: PROFILE_ID,
      },
    ]);
  });
});
