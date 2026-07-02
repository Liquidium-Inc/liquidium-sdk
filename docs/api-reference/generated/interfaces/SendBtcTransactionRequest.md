[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendBtcTransactionRequest

# Interface: SendBtcTransactionRequest

Defined in: [packages/client/src/core/wallet-actions.ts:69](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L69)

BTC transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L77)

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L79)

SDK action type that produced this request.

***

### amountSats?

> `optional` **amountSats?**: `bigint`

Defined in: [packages/client/src/core/wallet-actions.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L75)

Amount in satoshis when the SDK knows the transfer amount.

***

### chain

> **chain**: `"BTC"`

Defined in: [packages/client/src/core/wallet-actions.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L71)

BTC chain discriminator.

***

### toAddress

> **toAddress**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L73)

Recipient BTC address.

***

### transferMode

> **transferMode**: `"native"`

Defined in: [packages/client/src/core/wallet-actions.ts:81](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L81)

Transfer path associated with the action.
