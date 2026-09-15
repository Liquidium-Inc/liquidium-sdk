[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserLiquidationHistoryFilters

# Interface: UserLiquidationHistoryFilters

Defined in: packages/client/src/modules/history/types.ts:72

Filters for profile liquidation history requests.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: packages/client/src/modules/history/types.ts:74

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: packages/client/src/modules/history/types.ts:82

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: packages/client/src/modules/history/types.ts:76

Number of entries to return, from 1 to 200. Defaults to 50.

***

### market?

> `optional` **market?**: `string`

Defined in: packages/client/src/modules/history/types.ts:78

Alias for poolId. Ignored when poolId is provided.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: packages/client/src/modules/history/types.ts:80

Pool principal text filter.

***

### to?

> `optional` **to?**: `string`

Defined in: packages/client/src/modules/history/types.ts:84

Inclusive end timestamp filter accepted by the SDK API.
