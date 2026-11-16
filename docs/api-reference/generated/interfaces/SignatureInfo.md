[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignatureInfo

# Interface: SignatureInfo

Defined in: packages/client/src/core/wallet-actions.ts:132

Signature payload submitted to a sign-message action.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:138

Account that produced the signature, when different from the action default.

***

### chain

> **chain**: [`SigningChain`](../type-aliases/SigningChain.md)

Defined in: packages/client/src/core/wallet-actions.ts:136

Chain used to produce the signature.

***

### signature

> **signature**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:134

Wallet signature. BTC accepts base64 BIP-322 or hex; SOL requires 64 hex-encoded Ed25519 bytes.
