[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendBtcTransactionRequest

# Interface: SendBtcTransactionRequest

Defined in: packages/client/src/core/wallet-actions.ts:59

BTC transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:67

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:69

SDK action type that produced this request.

***

### amountSats?

> `optional` **amountSats?**: `bigint`

Defined in: packages/client/src/core/wallet-actions.ts:65

Amount in satoshis when the SDK knows the transfer amount.

***

### chain

> **chain**: `"BTC"`

Defined in: packages/client/src/core/wallet-actions.ts:61

BTC chain discriminator.

***

### toAddress

> **toAddress**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:63

Recipient BTC address.
