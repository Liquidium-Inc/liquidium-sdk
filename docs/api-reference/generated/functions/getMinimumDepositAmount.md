[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / getMinimumDepositAmount

# Function: getMinimumDepositAmount()

> **getMinimumDepositAmount**(`asset`): `bigint`

Defined in: [packages/client/src/core/deposit-minimums.ts:35](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/deposit-minimums.ts#L35)

Returns the minimum deposit amount for an asset in base units.

Assets without a configured product minimum return `0n`.

## Parameters

### asset

`string`

## Returns

`bigint`
