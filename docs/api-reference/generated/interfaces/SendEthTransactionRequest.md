[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendEthTransactionRequest

# Interface: SendEthTransactionRequest

Defined in: [packages/client/src/core/wallet-actions.ts:47](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L47)

ETH transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:53](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L53)

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L55)

SDK action type that produced this request.

***

### chain

> **chain**: `"ETH"`

Defined in: [packages/client/src/core/wallet-actions.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L49)

ETH chain discriminator.

***

### transaction

> **transaction**: [`EthTransactionRequest`](EthTransactionRequest.md)

Defined in: [packages/client/src/core/wallet-actions.ts:51](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L51)

Transaction payload to send.
