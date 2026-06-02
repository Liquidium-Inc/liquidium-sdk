[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / createTransferErc20Transaction

# Function: createTransferErc20Transaction()

> **createTransferErc20Transaction**(`params`): `object`

Defined in: [packages/client/src/modules/lending/evm-transactions.ts:27](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/evm-transactions.ts#L27)

Builds calldata for an ERC-20 `transfer(recipient, amount)` transaction.

## Parameters

### params

#### amount

`bigint`

#### recipientAddress

`string`

#### tokenAddress

`string`

## Returns

`object`

### data

> **data**: `string`

### to

> **to**: `string`
