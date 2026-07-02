[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowDetails

# Interface: OutflowDetails

Defined in: [packages/client/src/modules/lending/types.ts:148](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L148)

Receipt for a borrow or withdrawal outflow submitted to the lending canister.

`id` is the outflow reference to show users immediately. `txid` may be unset until
the protocol assigns a chain transaction id. `outflowRef` is an optional protocol reference.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:158](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L158)

Outflow amount in the pool asset's base units.

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:150](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L150)

Protocol outflow id.

***

### outflowRef?

> `optional` **outflowRef?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:154](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L154)

Optional protocol outflow reference.

***

### outflowType

> **outflowType**: [`OutflowType`](../type-aliases/OutflowType.md)

Defined in: [packages/client/src/modules/lending/types.ts:152](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L152)

Borrow, withdrawal, or fee-claim discriminator.

***

### receiver

> **receiver**: [`OutflowReceiver`](../type-aliases/OutflowReceiver.md)

Defined in: [packages/client/src/modules/lending/types.ts:160](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L160)

Outflow destination account.

***

### txid?

> `optional` **txid?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:156](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L156)

Chain transaction id when already assigned by the protocol.
