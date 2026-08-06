[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserTransactionHistoryFilters

# Interface: UserTransactionHistoryFilters

Defined in: packages/client/src/modules/history/types.ts:52

Filters for profile transaction history requests.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: packages/client/src/modules/history/types.ts:54

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: packages/client/src/modules/history/types.ts:66

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: packages/client/src/modules/history/types.ts:56

Number of entries to return, from 1 to 200. Defaults to 50.

***

### market?

> `optional` **market?**: `string`

Defined in: packages/client/src/modules/history/types.ts:58

Alias for poolId. Ignored when poolId is provided.

***

### operations?

> `optional` **operations?**: [`LiquidiumOperation`](../type-aliases/LiquidiumOperation.md)[]

Defined in: packages/client/src/modules/history/types.ts:62

Transaction operation filters.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: packages/client/src/modules/history/types.ts:60

Pool principal text filter.

***

### states?

> `optional` **states?**: [`UserTransactionHistoryState`](../type-aliases/UserTransactionHistoryState.md)[]

Defined in: packages/client/src/modules/history/types.ts:64

Lifecycle state filters.

***

### to?

> `optional` **to?**: `string`

Defined in: packages/client/src/modules/history/types.ts:68

Inclusive end timestamp filter accepted by the SDK API.
