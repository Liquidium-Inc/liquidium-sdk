[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowDetails

# Interface: OutflowDetails

Defined in: [packages/client/src/modules/lending/types.ts:67](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L67)

Receipt for a borrow or withdraw submitted to the lending canister.

`id` is the outflow reference to show users immediately. `txid` may be unset until
the protocol assigns a chain transaction id. `outflowRef` is an optional protocol reference.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L77)

Outflow amount in the pool asset's base units.

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:69](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L69)

Protocol outflow id.

***

### outflowRef?

> `optional` **outflowRef?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L73)

Optional protocol outflow reference.

***

### outflowType

> **outflowType**: [`OutflowType`](../type-aliases/OutflowType.md)

Defined in: [packages/client/src/modules/lending/types.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L71)

Borrow, withdraw, or fee-claim discriminator.

***

### receiver

> **receiver**: [`OutflowReceiver`](OutflowReceiver.md)

Defined in: [packages/client/src/modules/lending/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L79)

Outflow destination account.

***

### txid?

> `optional` **txid?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L75)

Chain transaction id when already assigned by the protocol.
