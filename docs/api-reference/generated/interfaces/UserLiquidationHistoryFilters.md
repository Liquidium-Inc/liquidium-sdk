[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserLiquidationHistoryFilters

# Interface: UserLiquidationHistoryFilters

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L77)

Filters for profile liquidation history requests.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L79)

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:87](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L87)

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:81](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L81)

Maximum number of entries to return.

***

### market?

> `optional` **market?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:83](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L83)

Market filter accepted by the SDK API.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:85](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L85)

Pool principal text filter.

***

### to?

> `optional` **to?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:89](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L89)

Inclusive end timestamp filter accepted by the SDK API.
