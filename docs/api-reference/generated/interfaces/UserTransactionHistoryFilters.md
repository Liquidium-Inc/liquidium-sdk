[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserTransactionHistoryFilters

# Interface: UserTransactionHistoryFilters

Defined in: [packages/client/src/modules/history/types.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L49)

Filters for profile transaction history requests.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:51](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L51)

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:63](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L63)

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: [packages/client/src/modules/history/types.ts:53](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L53)

Maximum number of entries to return.

***

### market?

> `optional` **market?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L55)

Market filter accepted by the SDK API.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:57](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L57)

Pool principal text filter.

***

### states?

> `optional` **states?**: [`UserTransactionHistoryState`](../type-aliases/UserTransactionHistoryState.md)[]

Defined in: [packages/client/src/modules/history/types.ts:61](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L61)

Lifecycle state filters.

***

### to?

> `optional` **to?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:65](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L65)

Inclusive end timestamp filter accepted by the SDK API.

***

### types?

> `optional` **types?**: [`UserTransactionHistoryType`](../type-aliases/UserTransactionHistoryType.md)[]

Defined in: [packages/client/src/modules/history/types.ts:59](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L59)

Transaction kind filters.
