[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ProtocolActivityEntry

# Interface: ProtocolActivityEntry

Defined in: packages/client/src/modules/history/types.ts:115

Completed protocol-wide lending activity entry.

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/history/types.ts:126

Raw amount in base units.

***

### asset

> **asset**: `string`

Defined in: packages/client/src/modules/history/types.ts:122

Asset ticker of the pool.

***

### decimals

> **decimals**: `number`

Defined in: packages/client/src/modules/history/types.ts:124

Decimal places of the raw amount.

***

### id

> **id**: `string`

Defined in: packages/client/src/modules/history/types.ts:116

***

### operation

> **operation**: [`LiquidiumOperation`](../type-aliases/LiquidiumOperation.md)

Defined in: packages/client/src/modules/history/types.ts:118

Lending operation that produced this activity.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/history/types.ts:120

Pool principal text the activity belongs to.

***

### timestamp

> **timestamp**: `string`

Defined in: packages/client/src/modules/history/types.ts:128

ISO-8601 timestamp of the confirmed activity.

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: packages/client/src/modules/history/types.ts:130

Chain transaction identifiers, when available.
