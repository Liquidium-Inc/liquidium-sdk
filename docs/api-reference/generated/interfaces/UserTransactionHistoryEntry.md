[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserTransactionHistoryEntry

# Interface: UserTransactionHistoryEntry

Defined in: [packages/client/src/modules/history/types.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L32)

Supply, borrow, repay, or withdraw entry in user history.

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

Defined in: [packages/client/src/modules/history/types.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L36)

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

> **type**: [`UserTransactionHistoryType`](../type-aliases/UserTransactionHistoryType.md)

Defined in: [packages/client/src/modules/history/types.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L34)

Transaction history kind.
