[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EstimateInflowFeeRequest

# Type Alias: EstimateInflowFeeRequest

> **EstimateInflowFeeRequest** = [`AssetIdentifier`](AssetIdentifier.md) & `Partial`\<`Pick`\<[`SolInflowFeeRequest`](../interfaces/SolInflowFeeRequest.md), `"poolId"` \| `"profileId"` \| `"action"`\>\>

Defined in: packages/client/src/modules/lending/types.ts:380

Asset and chain pair. SOL and ckSOL also require `poolId`, `profileId`, and
`action`; the SDK rejects SOL requests without them before any network call.
