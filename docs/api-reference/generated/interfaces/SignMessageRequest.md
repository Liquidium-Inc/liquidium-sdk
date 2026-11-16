[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignMessageRequest

# Interface: SignMessageRequest

Defined in: packages/client/src/core/wallet-actions.ts:36

Message-signing request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:42

Optional account override for the signing wallet.

***

### actionType

> **actionType**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:44

SDK action type that produced this request.

***

### chain

> **chain**: [`SigningChain`](../type-aliases/SigningChain.md)

Defined in: packages/client/src/core/wallet-actions.ts:38

Chain for the signing wallet.

***

### message

> **message**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:40

Plaintext message to sign.
