[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserLiquidationHistoryEntry

# Interface: UserLiquidationHistoryEntry

Defined in: [packages/client/src/modules/history/types.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L36)

Liquidation entry in user history.

## Extends

- `BaseUserHistoryEntry`

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:21](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L21)

#### Inherited from

`BaseUserHistoryEntry.amount`

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/history/types.ts:20](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L20)

#### Inherited from

`BaseUserHistoryEntry.id`

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/history/types.ts:22](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L22)

#### Inherited from

`BaseUserHistoryEntry.poolId`

***

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/history/types.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L40)

Current lifecycle status.

***

### timestamp

> **timestamp**: `string`

Defined in: [packages/client/src/modules/history/types.ts:23](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L23)

#### Inherited from

`BaseUserHistoryEntry.timestamp`

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: [packages/client/src/modules/history/types.ts:24](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L24)

#### Inherited from

`BaseUserHistoryEntry.txids`

***

### type

> **type**: `"liquidation"`

Defined in: [packages/client/src/modules/history/types.ts:38](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L38)

Liquidation kind discriminator.
