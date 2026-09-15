[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmContractTransaction

# Interface: EvmContractTransaction

Defined in: packages/client/src/modules/lending/types.ts:30

EVM transaction payload returned by lending transaction builders.

## Properties

### data

> **data**: `string`

Defined in: packages/client/src/modules/lending/types.ts:34

Hex-encoded calldata.

***

### to

> **to**: `string`

Defined in: packages/client/src/modules/lending/types.ts:32

Contract address to call.

***

### value?

> `optional` **value?**: `string`

Defined in: packages/client/src/modules/lending/types.ts:36

Native ETH value in wei, serialized as a decimal string.
