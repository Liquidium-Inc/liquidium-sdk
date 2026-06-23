[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserLiquidationHistoryFilters

# Interface: UserLiquidationHistoryFilters

Defined in: [packages/client/src/modules/history/types.ts:64](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L64)

Filters for profile liquidation history requests.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:66](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L66)

Pagination cursor from a previous response.

***

### from?

> `optional` **from?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:74](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L74)

Inclusive start timestamp filter accepted by the SDK API.

***

### limit?

> `optional` **limit?**: `number`

Defined in: [packages/client/src/modules/history/types.ts:68](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L68)

Maximum number of entries to return.

***

### market?

> `optional` **market?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:70](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L70)

Market filter accepted by the SDK API.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:72](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L72)

Pool principal text filter.

***

### to?

> `optional` **to?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:76](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L76)

Inclusive end timestamp filter accepted by the SDK API.
