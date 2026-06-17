[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcOutflowReceiver

# Interface: IcrcOutflowReceiver

Defined in: [packages/client/src/modules/lending/types.ts:76](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L76)

ICRC account destination for a completed outflow.

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:84](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L84)

Text-encoded ICRC account for display.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:80](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L80)

ICRC account owner principal text.

***

### subaccount?

> `optional` **subaccount?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: [packages/client/src/modules/lending/types.ts:82](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L82)

Optional ICRC subaccount bytes.

***

### type

> **type**: `"Icrc"`

Defined in: [packages/client/src/modules/lending/types.ts:78](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L78)

Destination account type reported by the protocol.
