[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserLiquidationHistoryEntry

# Interface: UserLiquidationHistoryEntry

Defined in: [packages/client/src/modules/history/types.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L40)

Liquidation entry in user history.

## Extends

- `BaseUserHistoryEntry`

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:25](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L25)

#### Inherited from

`BaseUserHistoryEntry.amount`

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/history/types.ts:24](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L24)

#### Inherited from

`BaseUserHistoryEntry.id`

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/history/types.ts:26](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L26)

#### Inherited from

`BaseUserHistoryEntry.poolId`

***

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/history/types.ts:44](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L44)

Current lifecycle status.

***

### timestamp

> **timestamp**: `string`

Defined in: [packages/client/src/modules/history/types.ts:27](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L27)

#### Inherited from

`BaseUserHistoryEntry.timestamp`

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: [packages/client/src/modules/history/types.ts:28](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L28)

#### Inherited from

`BaseUserHistoryEntry.txids`

***

### type

> **type**: `"liquidation"`

Defined in: [packages/client/src/modules/history/types.ts:42](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L42)

Liquidation kind discriminator.
