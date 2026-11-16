[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendBtcTransactionRequest

# Interface: SendBtcTransactionRequest

Defined in: packages/client/src/core/wallet-actions.ts:60

BTC transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:68

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:70

SDK action type that produced this request.

***

### amountSats?

> `optional` **amountSats?**: `bigint`

Defined in: packages/client/src/core/wallet-actions.ts:66

Amount in satoshis when the SDK knows the transfer amount.

***

### chain

> **chain**: `"BTC"`

Defined in: packages/client/src/core/wallet-actions.ts:62

BTC chain discriminator.

***

### toAddress

> **toAddress**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:64

Recipient BTC address.
