[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignatureInfo

# Interface: SignatureInfo

Defined in: packages/client/src/core/wallet-actions.ts:120

Signature payload submitted to a sign-message action.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:126

Account that produced the signature, when different from the action default.

***

### chain

> **chain**: [`SigningChain`](../type-aliases/SigningChain.md)

Defined in: packages/client/src/core/wallet-actions.ts:124

Chain used to produce the signature.

***

### signature

> **signature**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:122

Wallet signature over the action message. BTC signatures may be base64 BIP-322 or hex-encoded bytes.
