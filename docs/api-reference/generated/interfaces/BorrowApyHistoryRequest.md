[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BorrowApyHistoryRequest

# Interface: BorrowApyHistoryRequest

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:96](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L96)

Time-window and pagination options for borrow APY history.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:98](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L98)

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:102](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L102)

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:100](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L100)

Maximum number of samples to return.

***

### to?

> `optional` **to?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:104](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L104)

Inclusive end timestamp filter accepted by the SDK API.
