[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / createTransferErc20Transaction

# Function: createTransferErc20Transaction()

> **createTransferErc20Transaction**(`params`): `object`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/evm-transactions.ts:27](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/evm-transactions.ts#L27)

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
