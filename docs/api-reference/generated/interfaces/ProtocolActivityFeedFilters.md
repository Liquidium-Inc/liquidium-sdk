[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ProtocolActivityFeedFilters

# Interface: ProtocolActivityFeedFilters

Defined in: packages/client/src/modules/history/types.ts:134

Filters for protocol-wide activity feed requests.

## Properties

### limit?

> `optional` **limit?**: `number`

Defined in: packages/client/src/modules/history/types.ts:136

Number of entries to return, from 1 to 100. Defaults to 50.

***

### operations?

> `optional` **operations?**: [`LiquidiumOperation`](../type-aliases/LiquidiumOperation.md)[]

Defined in: packages/client/src/modules/history/types.ts:140

Operation filters.

***

### poolId?

> `optional` **poolId?**: `string`

Defined in: packages/client/src/modules/history/types.ts:138

Pool principal text filter.
