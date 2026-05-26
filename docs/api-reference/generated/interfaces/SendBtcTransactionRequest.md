[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendBtcTransactionRequest

# Interface: SendBtcTransactionRequest

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:86](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L86)

BTC transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:94](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L94)

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:96](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L96)

SDK action type that produced this request.

***

### amountSats?

> `optional` **amountSats?**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:92](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L92)

Amount in satoshis when the SDK knows the transfer amount.

***

### chain

> **chain**: `"BTC"`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:88](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L88)

BTC chain discriminator.

***

### toAddress

> **toAddress**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:90](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L90)

Recipient BTC address.

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:98](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L98)

Transfer path associated with the action.
