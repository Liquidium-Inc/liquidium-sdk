[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmContractTransaction

# Interface: EvmContractTransaction

Defined in: [packages/client/src/modules/lending/types.ts:30](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L30)

EVM transaction payload returned by lending transaction builders.

## Properties

### data

> **data**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L34)

Hex-encoded calldata.

***

### to

> **to**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L32)

Contract address to call.

***

### value?

> `optional` **value?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L36)

Native ETH value in wei, serialized as a decimal string.
