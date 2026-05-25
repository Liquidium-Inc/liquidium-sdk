[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserTransactionHistoryFilters

# Interface: UserTransactionHistoryFilters

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:57](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L57)

Filters for profile transaction history requests.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:59](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L59)

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L71)

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:61](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L61)

Maximum number of entries to return.

***

### market?

> `optional` **market?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:63](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L63)

Market filter accepted by the SDK API.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:65](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L65)

Pool principal text filter.

***

### statuses?

> `optional` **statuses?**: [`UserHistoryStatus`](../type-aliases/UserHistoryStatus.md)[]

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:69](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L69)

Status filters.

***

### to?

> `optional` **to?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L73)

Inclusive end timestamp filter accepted by the SDK API.

***

### types?

> `optional` **types?**: [`UserTransactionHistoryType`](../type-aliases/UserTransactionHistoryType.md)[]

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:67](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L67)

Transaction kind filters.
