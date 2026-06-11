[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BorrowApyHistoryRequest

# Interface: BorrowApyHistoryRequest

Defined in: [packages/client/src/modules/history/types.ts:92](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L92)

Time-window and pagination options for borrow APY history.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:94](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L94)

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:98](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L98)

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: [packages/client/src/modules/history/types.ts:96](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L96)

Maximum number of samples to return.

***

### to?

> `optional` **to?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:100](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L100)

Inclusive end timestamp filter accepted by the SDK API.
