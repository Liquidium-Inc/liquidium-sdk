[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserTransactionHistoryFilters

# Interface: UserTransactionHistoryFilters

Defined in: [packages/client/src/modules/history/types.ts:44](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L44)

Filters for profile transaction history requests.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:46](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L46)

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:58](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L58)

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: [packages/client/src/modules/history/types.ts:48](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L48)

Maximum number of entries to return.

***

### market?

> `optional` **market?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:50](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L50)

Market filter accepted by the SDK API.

***

### operations?

> `optional` **operations?**: [`LiquidiumOperation`](../type-aliases/LiquidiumOperation.md)[]

Defined in: [packages/client/src/modules/history/types.ts:54](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L54)

Transaction operation filters.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:52](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L52)

Pool principal text filter.

***

### states?

> `optional` **states?**: [`UserTransactionHistoryState`](../type-aliases/UserTransactionHistoryState.md)[]

Defined in: [packages/client/src/modules/history/types.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L56)

Lifecycle state filters.

***

### to?

> `optional` **to?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:60](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L60)

Inclusive end timestamp filter accepted by the SDK API.
