[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowDetails

# Interface: OutflowDetails

Defined in: [packages/client/src/modules/lending/types.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L32)

Receipt for a borrow or withdraw submitted to the lending canister.

`id` is the outflow reference to show users immediately. `txid` may be unset until
the protocol assigns a chain transaction id. `outflowRef` is an optional protocol reference.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:42](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L42)

Outflow amount in the pool asset's base units.

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L34)

Protocol outflow id.

***

### outflowRef?

> `optional` **outflowRef?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:38](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L38)

Optional protocol outflow reference.

***

### outflowType

> **outflowType**: [`OutflowType`](../type-aliases/OutflowType.md)

Defined in: [packages/client/src/modules/lending/types.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L36)

Borrow, withdraw, or fee-claim discriminator.

***

### receiver

> **receiver**: [`OutflowReceiver`](OutflowReceiver.md)

Defined in: [packages/client/src/modules/lending/types.ts:44](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L44)

Outflow destination account.

***

### txid?

> `optional` **txid?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L40)

Chain transaction id when already assigned by the protocol.
