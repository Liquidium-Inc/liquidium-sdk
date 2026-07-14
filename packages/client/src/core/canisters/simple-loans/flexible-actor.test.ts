import { idlLabelToId } from "@icp-sdk/core/candid";
import type { Principal } from "@icp-sdk/core/principal";
import { describe, expect, test } from "vitest";
import {
  decodeFlexibleHeadlessLoanEvent,
  decodeFlexibleSimpleLoanRecord,
  type FlexibleHeadlessLoanEvent,
  type FlexibleSimpleLoanCanisterRecord,
} from "./flexible-actor";

const POOL_PRINCIPAL = {
  toString: () => "pool-1",
} as unknown as Principal;

const PROFILE_PRINCIPAL = {
  toString: () => "profile-1",
} as unknown as Principal;

const AUTHORISATION = {
  EthSignature: {
    derivation_index: new Uint8Array([1, 2, 3]),
    pubkey: new Uint8Array([4, 5, 6]),
    address: "0xabc",
  },
};

function createFlexibleSimpleLoanRecord(
  overrides?: Partial<FlexibleSimpleLoanCanisterRecord>
): FlexibleSimpleLoanCanisterRecord {
  return {
    id: 1n,
    authorisation: AUTHORISATION,
    borrow_destination: { External: "borrow-addr" },
    started: false,
    lend_asset: { BTC: null },
    created_at: 1_000n,
    schema_version: 1,
    borrow_amount: 10_000n,
    lend_pool_id: POOL_PRINCIPAL,
    refund_destination: { External: "refund-addr" },
    ltv_max_bps: 7_000n,
    ltv_timer_s: 3_600n,
    lending_profile: PROFILE_PRINCIPAL,
    borrow_pool_id: POOL_PRINCIPAL,
    borrow_asset: { USDC: null },
    expires_at: [],
    deposit_detected_ts: [],
    ...overrides,
  };
}

function createFlexibleHeadlessLoanEvent(
  overrides?: Partial<FlexibleHeadlessLoanEvent>
): FlexibleHeadlessLoanEvent {
  return {
    id: 1n,
    schema_version: 1,
    timestamp: 2_000n,
    event_type: {
      LoanCreated: {
        loan_id: 1n,
        borrow_destination: { External: "borrow-addr" },
        lend_asset: { BTC: null },
        borrow_amount: 10_000n,
        lend_pool_id: POOL_PRINCIPAL,
        refund_destination: { External: "refund-addr" },
        ltv_max_bps: 7_000n,
        ltv_timer_s: 3_600n,
        lending_profile: PROFILE_PRINCIPAL,
        borrow_pool_id: POOL_PRINCIPAL,
        borrow_asset: { USDC: null },
      },
    },
    ...overrides,
  };
}

describe("decodeFlexibleSimpleLoanRecord", () => {
  test("should decode a loan with known asset tags", () => {
    // given
    const record = createFlexibleSimpleLoanRecord();

    // when
    const decoded = decodeFlexibleSimpleLoanRecord(record);

    // then
    expect(decoded).not.toBeNull();
    expect(decoded?.lend_asset).toBe("BTC");
    expect(decoded?.borrow_asset).toBe("USDC");
  });

  test("should decode native ETH from known and hashed asset tags", () => {
    // given
    const ethHash = idlLabelToId("ETH");
    const record = createFlexibleSimpleLoanRecord({
      lend_asset: { ETH: null },
      borrow_asset: { [`_${ethHash}_`]: null },
    });

    // when
    const decoded = decodeFlexibleSimpleLoanRecord(record);

    // then
    expect(decoded).not.toBeNull();
    expect(decoded?.lend_asset).toBe("ETH");
    expect(decoded?.borrow_asset).toBe("ETH");
  });

  test("should decode a loan with hashed variant keys from IDL.Unknown", () => {
    // given
    const lendHash = idlLabelToId("USDT");
    const borrowHash = idlLabelToId("USDT");
    const record = createFlexibleSimpleLoanRecord({
      lend_asset: { [`_${lendHash}_`]: null },
      borrow_asset: { [`_${borrowHash}_`]: null },
    });

    // when
    const decoded = decodeFlexibleSimpleLoanRecord(record);

    // then
    expect(decoded).not.toBeNull();
    expect(decoded?.lend_asset).toBe("USDT");
    expect(decoded?.borrow_asset).toBe("USDT");
  });

  test("should return null for an unsupported SOL asset tag", () => {
    // given
    const record = createFlexibleSimpleLoanRecord({
      lend_asset: { SOL: null },
    });

    // when
    const decoded = decodeFlexibleSimpleLoanRecord(record);

    // then
    expect(decoded).toBeNull();
  });

  test("should return null for an unknown lend asset tag", () => {
    // given
    const record = createFlexibleSimpleLoanRecord({
      lend_asset: { DOGE: null },
    });

    // when
    const decoded = decodeFlexibleSimpleLoanRecord(record);

    // then
    expect(decoded).toBeNull();
  });

  test("should return null for an unknown borrow asset tag", () => {
    // given
    const record = createFlexibleSimpleLoanRecord({
      borrow_asset: { DOGE: null },
    });

    // when
    const decoded = decodeFlexibleSimpleLoanRecord(record);

    // then
    expect(decoded).toBeNull();
  });

  test("should return null when an asset variant is empty", () => {
    // given
    const record = createFlexibleSimpleLoanRecord({ lend_asset: {} });

    // when
    const decoded = decodeFlexibleSimpleLoanRecord(record);

    // then
    expect(decoded).toBeNull();
  });
});

describe("decodeFlexibleHeadlessLoanEvent", () => {
  test("should decode a LoanCreated event with known asset tags", () => {
    // given
    const event = createFlexibleHeadlessLoanEvent();

    // when
    const decoded = decodeFlexibleHeadlessLoanEvent(event);

    // then
    expect(decoded).not.toBeNull();
    const eventType = decoded?.event_type;
    expect(eventType).toBeDefined();
    if (eventType && "LoanCreated" in eventType) {
      expect(eventType.LoanCreated.lend_asset).toBe("BTC");
      expect(eventType.LoanCreated.borrow_asset).toBe("USDC");
    }
  });

  test("should decode native ETH in a LoanCreated event", () => {
    // given
    const ethHash = idlLabelToId("ETH");
    const event = createFlexibleHeadlessLoanEvent({
      event_type: {
        LoanCreated: {
          loan_id: 1n,
          borrow_destination: { External: "0xborrow" },
          lend_asset: { [`_${ethHash}_`]: null },
          borrow_amount: 10_000n,
          lend_pool_id: POOL_PRINCIPAL,
          refund_destination: { External: "0xrefund" },
          ltv_max_bps: 7_000n,
          ltv_timer_s: 3_600n,
          lending_profile: PROFILE_PRINCIPAL,
          borrow_pool_id: POOL_PRINCIPAL,
          borrow_asset: { ETH: null },
        },
      },
    });

    // when
    const decoded = decodeFlexibleHeadlessLoanEvent(event);

    // then
    expect(decoded).not.toBeNull();
    const eventType = decoded?.event_type;
    if (eventType && "LoanCreated" in eventType) {
      expect(eventType.LoanCreated.lend_asset).toBe("ETH");
      expect(eventType.LoanCreated.borrow_asset).toBe("ETH");
    }
  });

  test("should decode a LoanCreated event with hashed variant keys", () => {
    // given
    const lendHash = idlLabelToId("USDT");
    const borrowHash = idlLabelToId("USDT");
    const event = createFlexibleHeadlessLoanEvent({
      event_type: {
        LoanCreated: {
          loan_id: 1n,
          borrow_destination: { External: "borrow-addr" },
          lend_asset: { [`_${lendHash}_`]: null },
          borrow_amount: 10_000n,
          lend_pool_id: POOL_PRINCIPAL,
          refund_destination: { External: "refund-addr" },
          ltv_max_bps: 7_000n,
          ltv_timer_s: 3_600n,
          lending_profile: PROFILE_PRINCIPAL,
          borrow_pool_id: POOL_PRINCIPAL,
          borrow_asset: { [`_${borrowHash}_`]: null },
        },
      },
    });

    // when
    const decoded = decodeFlexibleHeadlessLoanEvent(event);

    // then
    expect(decoded).not.toBeNull();
    const eventType = decoded?.event_type;
    expect(eventType).toBeDefined();
    if (eventType && "LoanCreated" in eventType) {
      expect(eventType.LoanCreated.lend_asset).toBe("USDT");
      expect(eventType.LoanCreated.borrow_asset).toBe("USDT");
    }
  });

  test("should return null for a LoanCreated event with an unknown asset tag", () => {
    // given
    const event = createFlexibleHeadlessLoanEvent({
      event_type: {
        LoanCreated: {
          loan_id: 1n,
          borrow_destination: { External: "borrow-addr" },
          lend_asset: { DOGE: null },
          borrow_amount: 10_000n,
          lend_pool_id: POOL_PRINCIPAL,
          refund_destination: { External: "refund-addr" },
          ltv_max_bps: 7_000n,
          ltv_timer_s: 3_600n,
          lending_profile: PROFILE_PRINCIPAL,
          borrow_pool_id: POOL_PRINCIPAL,
          borrow_asset: { USDC: null },
        },
      },
    });

    // when
    const decoded = decodeFlexibleHeadlessLoanEvent(event);

    // then
    expect(decoded).toBeNull();
  });

  test("should pass through non-LoanCreated events unchanged", () => {
    // given
    const event = createFlexibleHeadlessLoanEvent({
      event_type: {
        DepositTimerExceeded: { loan_id: 42n },
      },
    });

    // when
    const decoded = decodeFlexibleHeadlessLoanEvent(event);

    // then
    expect(decoded).not.toBeNull();
    expect(decoded?.event_type).toEqual({
      DepositTimerExceeded: { loan_id: 42n },
    });
  });
});
