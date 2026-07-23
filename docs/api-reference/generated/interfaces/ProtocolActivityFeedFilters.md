[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ProtocolActivityFeedFilters

# Interface: ProtocolActivityFeedFilters

Defined in: [packages/client/src/modules/history/types.ts:134](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L134)

Filters for protocol-wide activity feed requests.

## Properties

### limit?

> `optional` **limit?**: `number`

Defined in: [packages/client/src/modules/history/types.ts:136](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L136)

Number of entries to return, from 1 to 100. Defaults to 50.

***

### operations?

> `optional` **operations?**: [`LiquidiumOperation`](../type-aliases/LiquidiumOperation.md)[]

Defined in: [packages/client/src/modules/history/types.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L140)

Operation filters.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L138)

Pool principal text filter.
