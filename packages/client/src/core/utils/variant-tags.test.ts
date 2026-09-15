import { idlLabelToId } from "@icp-sdk/core/candid";
import { describe, expect, test } from "vitest";
import {
  extractVariantTag,
  KNOWN_ASSET_TAGS,
  KNOWN_CHAIN_TAGS,
} from "./variant-tags";

describe("extractVariantTag", () => {
  test("should return a known tag name directly", () => {
    // given
    const variant = { BTC: null };

    // when
    const tag = extractVariantTag(variant, KNOWN_ASSET_TAGS);

    // then
    expect(tag).toBe("BTC");
  });

  test("should decode a supported hashed variant key from IDL.Unknown", () => {
    // given
    const hash = idlLabelToId("USDT");
    const variant = { [`_${hash}_`]: null };

    // when
    const tag = extractVariantTag(variant, KNOWN_ASSET_TAGS);

    // then
    expect(tag).toBe("USDT");
  });

  test("should decode an ICP asset tag", () => {
    // given
    const variant = { ICP: null };

    // when
    const tag = extractVariantTag(variant, KNOWN_ASSET_TAGS);

    // then
    expect(tag).toBe("ICP");
  });

  test("should decode a hashed ETH asset tag", () => {
    // given
    const hash = idlLabelToId("ETH");
    const variant = { [`_${hash}_`]: null };

    // when
    const tag = extractVariantTag(variant, KNOWN_ASSET_TAGS);

    // then
    expect(tag).toBe("ETH");
  });

  test("should return null for an unsupported hashed tag", () => {
    // given
    const hash = idlLabelToId("SOL");
    const variant = { [`_${hash}_`]: null };

    // when
    const tag = extractVariantTag(variant, KNOWN_ASSET_TAGS);

    // then
    expect(tag).toBeNull();
  });

  test("should return null for an unknown tag", () => {
    // given
    const variant = { DOGE: null };

    // when
    const tag = extractVariantTag(variant, KNOWN_ASSET_TAGS);

    // then
    expect(tag).toBeNull();
  });

  test("should return null for an unknown hashed tag", () => {
    // given
    const hash = idlLabelToId("DOGE");
    const variant = { [`_${hash}_`]: null };

    // when
    const tag = extractVariantTag(variant, KNOWN_ASSET_TAGS);

    // then
    expect(tag).toBeNull();
  });

  test("should return null for an empty variant", () => {
    // given
    const variant = {};

    // when
    const tag = extractVariantTag(variant, KNOWN_ASSET_TAGS);

    // then
    expect(tag).toBeNull();
  });

  test("should work with chain tags", () => {
    // given
    const hash = idlLabelToId("ETH");
    const variant = { [`_${hash}_`]: null };

    // when
    const tag = extractVariantTag(variant, KNOWN_CHAIN_TAGS);

    // then
    expect(tag).toBe("ETH");
  });

  test("should decode an ICP chain tag", () => {
    // given
    const variant = { ICP: null };

    // when
    const tag = extractVariantTag(variant, KNOWN_CHAIN_TAGS);

    // then
    expect(tag).toBe("ICP");
  });
});
