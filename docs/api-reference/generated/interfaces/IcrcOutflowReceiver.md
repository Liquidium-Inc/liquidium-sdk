[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcOutflowReceiver

# Interface: IcrcOutflowReceiver

Defined in: [packages/client/src/modules/lending/types.ts:101](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L101)

ICRC account destination for a completed outflow.

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L109)

Text-encoded ICRC account for display.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:105](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L105)

ICRC account owner principal text.

***

### subaccount?

> `optional` **subaccount?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: [packages/client/src/modules/lending/types.ts:107](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L107)

Optional ICRC subaccount bytes.

***

### type

> **type**: `"Icrc"`

Defined in: [packages/client/src/modules/lending/types.ts:103](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L103)

Destination account type reported by the protocol.
