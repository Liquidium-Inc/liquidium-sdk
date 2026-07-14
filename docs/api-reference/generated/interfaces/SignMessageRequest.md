[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignMessageRequest

# Interface: SignMessageRequest

Defined in: [packages/client/src/core/wallet-actions.ts:35](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L35)

Message-signing request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:41](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L41)

Optional account override for the signing wallet.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:43](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L43)

SDK action type that produced this request.

***

### chain

> **chain**: [`SigningChain`](../type-aliases/SigningChain.md)

Defined in: [packages/client/src/core/wallet-actions.ts:37](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L37)

Chain for the signing wallet.

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:39](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L39)

Plaintext message to sign.
