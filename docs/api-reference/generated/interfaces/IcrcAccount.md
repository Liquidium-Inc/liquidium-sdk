[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccount

# Interface: IcrcAccount

Defined in: packages/client/src/core/accounts.ts:44

ICRC account display shape shared by lending and Simple Loans responses.

## Properties

### address

> **address**: `string`

Defined in: packages/client/src/core/accounts.ts:52

Text-encoded ICRC account for display.

***

### owner

> **owner**: `string`

Defined in: packages/client/src/core/accounts.ts:48

ICRC account owner principal text.

***

### subaccount?

> `optional` **subaccount?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: packages/client/src/core/accounts.ts:50

Optional ICRC subaccount bytes.

***

### type

> **type**: `"IcrcAccount"`

Defined in: packages/client/src/core/accounts.ts:46

Account type.
