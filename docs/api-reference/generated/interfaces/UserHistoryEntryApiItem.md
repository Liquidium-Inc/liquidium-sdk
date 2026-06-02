[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserHistoryEntryApiItem

# Interface: UserHistoryEntryApiItem

Defined in: [packages/client/src/modules/history/types.ts:135](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L135)

Wire-format user history item returned by the SDK API.

## Properties

### amount

> **amount**: `string`

Defined in: [packages/client/src/modules/history/types.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L138)

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/history/types.ts:136](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L136)

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/history/types.ts:139](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L139)

***

### status

> **status**: `"PENDING"` \| `"REQUESTED"` \| `"CONFIRMED"` \| `"FAILED"`

Defined in: [packages/client/src/modules/history/types.ts:141](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L141)

***

### timestamp

> **timestamp**: `string`

Defined in: [packages/client/src/modules/history/types.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L140)

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: [packages/client/src/modules/history/types.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L142)

***

### type

> **type**: [`UserHistoryType`](../type-aliases/UserHistoryType.md)

Defined in: [packages/client/src/modules/history/types.ts:137](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L137)
