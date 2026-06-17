[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccount

# Interface: IcrcAccount

Defined in: [packages/client/src/modules/instant-loans/types.ts:50](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L50)

ICRC account returned by existing or future canister state.

## Properties

### address

> **address**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:58](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L58)

Text-encoded ICRC account for display.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:54](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L54)

ICRC account owner principal text.

***

### subaccount?

> `optional` **subaccount?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: [packages/client/src/modules/instant-loans/types.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L56)

Optional ICRC subaccount bytes.

***

### type

> **type**: `"Icrc"`

Defined in: [packages/client/src/modules/instant-loans/types.ts:52](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L52)

Account kind discriminator.
