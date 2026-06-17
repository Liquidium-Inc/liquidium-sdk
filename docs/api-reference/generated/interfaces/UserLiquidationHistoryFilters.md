[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserLiquidationHistoryFilters

# Interface: UserLiquidationHistoryFilters

Defined in: [packages/client/src/modules/history/types.ts:69](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L69)

Filters for profile liquidation history requests.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L71)

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L79)

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: [packages/client/src/modules/history/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L73)

Maximum number of entries to return.

***

### market?

> `optional` **market?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L75)

Market filter accepted by the SDK API.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L77)

Pool principal text filter.

***

### to?

> `optional` **to?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:81](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L81)

Inclusive end timestamp filter accepted by the SDK API.
