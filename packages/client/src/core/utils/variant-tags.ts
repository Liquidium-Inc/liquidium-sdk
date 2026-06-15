import { idlLabelToId } from "@icp-sdk/core/candid";

// Asset and chain tags supported by this SDK version. Unknown tags returned by
// the canister are ignored rather than causing the whole call to fail.
export const KNOWN_ASSET_TAGS = ["BTC", "SOL", "USDC", "USDT"] as const;
export const KNOWN_CHAIN_TAGS = ["BTC", "ETH", "SOL"] as const;

export type KnownAssetTag = (typeof KNOWN_ASSET_TAGS)[number];
export type KnownChainTag = (typeof KNOWN_CHAIN_TAGS)[number];

export function extractVariantTag(
  variant: object,
  knownTags: readonly string[]
): string | null {
  const [key] = Object.keys(variant);

  if (!key) {
    return null;
  }

  // Known variants decoded by a matching IDL already use the tag name.
  if (knownTags.includes(key)) {
    return key;
  }

  // IDL.Unknown returns variants with hashed field names: _${hash}_
  const hashMatch = /^_(\d+)_$/.exec(key);
  if (!hashMatch) {
    return null;
  }

  const hash = Number(hashMatch[1]);

  for (const tag of knownTags) {
    if (idlLabelToId(tag) === hash) {
      return tag;
    }
  }

  return null;
}
