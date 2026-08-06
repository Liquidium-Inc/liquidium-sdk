[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EthTransactionRequest

# Interface: EthTransactionRequest

Defined in: packages/client/src/core/wallet-actions.ts:23

EVM transaction request passed to wallet adapters.

## Properties

### chainId?

> `optional` **chainId?**: `number`

Defined in: packages/client/src/core/wallet-actions.ts:31

Optional EVM chain id for wallet implementations that require it.

***

### data?

> `optional` **data?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:27

Hex-encoded calldata for contract interactions.

***

### to

> **to**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:25

Destination address or contract address.

***

### value?

> `optional` **value?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:29

Native ETH value in wei, serialized as a decimal string.
