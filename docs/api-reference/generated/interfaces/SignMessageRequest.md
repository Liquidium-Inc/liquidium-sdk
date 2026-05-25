[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignMessageRequest

# Interface: SignMessageRequest

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:44](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L44)

Message-signing request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:50](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L50)

Optional account override for the signing wallet.

***

### actionType

> **actionType**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:52](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L52)

SDK action type that produced this request.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:46](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L46)

Chain for the signing wallet.

***

### message

> **message**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:48](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L48)

Plaintext message to sign.

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:54](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L54)

Transfer path associated with the action.
