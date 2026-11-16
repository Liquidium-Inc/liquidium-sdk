[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmContractTransaction

# Interface: EvmContractTransaction

Defined in: packages/client/src/modules/lending/types.ts:31

EVM transaction payload returned by lending transaction builders.

## Properties

### data

> **data**: `string`

Defined in: packages/client/src/modules/lending/types.ts:35

Hex-encoded calldata.

***

### to

> **to**: `string`

Defined in: packages/client/src/modules/lending/types.ts:33

Contract address to call.

***

### value?

> `optional` **value?**: `string`

Defined in: packages/client/src/modules/lending/types.ts:37

Native ETH value in wei, serialized as a decimal string.
