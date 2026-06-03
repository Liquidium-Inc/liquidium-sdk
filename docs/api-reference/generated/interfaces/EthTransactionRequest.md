[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EthTransactionRequest

# Interface: EthTransactionRequest

Defined in: [packages/client/src/core/wallet-actions.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L32)

EVM transaction request passed to wallet adapters.

## Properties

### chainId?

> `optional` **chainId?**: `number`

Defined in: [packages/client/src/core/wallet-actions.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L40)

Optional EVM chain id for wallet implementations that require it.

***

### data?

> `optional` **data?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L36)

Hex-encoded calldata for contract interactions.

***

### to

> **to**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L34)

Destination address or contract address.

***

### value?

> `optional` **value?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:38](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L38)

Native ETH value in wei, serialized as a decimal string.
