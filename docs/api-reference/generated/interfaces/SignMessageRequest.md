[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignMessageRequest

# Interface: SignMessageRequest

Defined in: [packages/client/src/core/wallet-actions.ts:41](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L41)

Message-signing request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:47](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L47)

Optional account override for the signing wallet.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L49)

SDK action type that produced this request.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/core/wallet-actions.ts:43](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L43)

Chain for the signing wallet.

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:45](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L45)

Plaintext message to sign.

***

### transferMode

> **transferMode**: `"native"`

Defined in: [packages/client/src/core/wallet-actions.ts:51](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L51)

Transfer path associated with the action.
