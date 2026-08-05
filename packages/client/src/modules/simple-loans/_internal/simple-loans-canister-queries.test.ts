import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LiquidiumClient } from "../../../index";
import { createLoanCreatedEvent, LOAN_ID, PROFILE_ID } from "./test-fixtures";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("SimpleLoansModule canister queries", () => {
  test("calls public Simple Loans query methods directly on the canister", async () => {
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
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const config = await client.simpleLoans.getConfig();
    const event = await client.simpleLoans.getEvent(1n);
    const events = await client.simpleLoans.listEvents({
      start: 1n,
      limit: 10n,
    });
    const accessList = await client.simpleLoans.listAccessList();
    const warmedProfileCount = await client.simpleLoans.countWarmedProfiles();
    const warmedProfiles = await client.simpleLoans.listWarmedProfiles();

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

  test("maps ICP-authorized warmed profiles and events", async () => {
    // given
    const subaccount = new Uint8Array(32).fill(7);
    const lendingProfile = Principal.fromText(PROFILE_ID);
    vi.spyOn(Actor, "createActor").mockReturnValue({
      get_event: vi.fn().mockResolvedValue([
        {
          id: 9n,
          schema_version: 1,
          timestamp: 123n,
          event_type: {
            IcpProfileWarmed: {
              subaccount,
              warmed_profile_id: 7n,
              lending_profile: lendingProfile,
            },
          },
        },
      ]),
      list_warmed_profiles: vi.fn().mockResolvedValue([
        {
          id: 7n,
          authorisation: { IcpCaller: { subaccount } },
          created_at: 123n,
          lending_profile: lendingProfile,
        },
      ]),
    } as never);
    const client = new LiquidiumClient({
      canisterIds: { simpleLoans: "kzrva-ziaaa-aaaar-qamyq-cai" },
    });

    // when
    const event = await client.simpleLoans.getEvent(9n);
    const warmedProfiles = await client.simpleLoans.listWarmedProfiles();

    // then
    expect(event).toEqual({
      id: 9n,
      schemaVersion: 1,
      timestamp: 123n,
      eventType: {
        type: "IcpProfileWarmed",
        subaccount,
        warmedProfileId: 7n,
        profileId: PROFILE_ID,
      },
    });
    expect(warmedProfiles).toEqual([
      {
        id: 7n,
        authorization: { type: "IcpCaller", subaccount },
        createdAt: 123n,
        profileId: PROFILE_ID,
      },
    ]);
  });
});
