[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendBtcTransactionRequest

# Interface: SendBtcTransactionRequest

Defined in: [packages/client/src/core/wallet-actions.ts:59](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L59)

BTC transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:67](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L67)

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:69](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L69)

SDK action type that produced this request.

***

### amountSats?

> `optional` **amountSats?**: `bigint`

Defined in: [packages/client/src/core/wallet-actions.ts:65](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L65)

Amount in satoshis when the SDK knows the transfer amount.

***

### chain

> **chain**: `"BTC"`

Defined in: [packages/client/src/core/wallet-actions.ts:61](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L61)

BTC chain discriminator.

***

### toAddress

> **toAddress**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:63](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L63)

Recipient BTC address.
