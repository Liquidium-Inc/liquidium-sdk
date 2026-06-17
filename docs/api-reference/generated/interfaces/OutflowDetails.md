[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowDetails

# Interface: OutflowDetails

Defined in: [packages/client/src/modules/lending/types.ts:66](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L66)

Receipt for a borrow or withdrawal outflow submitted to the lending canister.

`id` is the outflow reference to show users immediately. `txid` may be unset until
the protocol assigns a chain transaction id. `outflowRef` is an optional protocol reference.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:76](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L76)

Outflow amount in the pool asset's base units.

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:68](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L68)

Protocol outflow id.

***

### outflowRef?

> `optional` **outflowRef?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:72](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L72)

Optional protocol outflow reference.

***

### outflowType

> **outflowType**: [`OutflowType`](../type-aliases/OutflowType.md)

Defined in: [packages/client/src/modules/lending/types.ts:70](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L70)

Borrow, withdrawal, or fee-claim discriminator.

***

### receiver

> **receiver**: [`OutflowReceiver`](OutflowReceiver.md)

Defined in: [packages/client/src/modules/lending/types.ts:78](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L78)

Outflow destination account.

***

### txid?

> `optional` **txid?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:74](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L74)

Chain transaction id when already assigned by the protocol.
