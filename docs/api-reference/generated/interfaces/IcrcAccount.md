[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccount

# Interface: IcrcAccount

Defined in: [packages/client/src/core/accounts.ts:9](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/accounts.ts#L9)

ICRC account display shape shared by lending and instant-loan responses.

## Properties

### address

> **address**: `string`

Defined in: [packages/client/src/core/accounts.ts:17](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/accounts.ts#L17)

Text-encoded ICRC account for display.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/core/accounts.ts:13](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/accounts.ts#L13)

ICRC account owner principal text.

***

### subaccount?

> `optional` **subaccount?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: [packages/client/src/core/accounts.ts:15](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/accounts.ts#L15)

Optional ICRC subaccount bytes.

***

### type

> **type**: `"Icrc"`

Defined in: [packages/client/src/core/accounts.ts:11](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/accounts.ts#L11)

Account kind discriminator.
