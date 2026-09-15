[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanEthSignatureAuthorization

# ~~Interface: SimpleLoanEthSignatureAuthorization~~

Defined in: packages/client/src/modules/simple-loans/types.ts:229

Legacy Ethereum-signature authentication metadata for a warmed Simple Loans profile.

## Deprecated

New warmed profiles use `SimpleLoanIcpCallerAuthorization`. This
type remains supported for old canisters and existing profiles.

## Properties

### ~~address~~

> **address**: `string`

Defined in: packages/client/src/modules/simple-loans/types.ts:233

***

### ~~derivationIndex~~

> **derivationIndex**: `Uint8Array`

Defined in: packages/client/src/modules/simple-loans/types.ts:231

***

### ~~publicKey~~

> **publicKey**: `Uint8Array`

Defined in: packages/client/src/modules/simple-loans/types.ts:232

***

### ~~type~~

> **type**: `"EthSignature"`

Defined in: packages/client/src/modules/simple-loans/types.ts:230
