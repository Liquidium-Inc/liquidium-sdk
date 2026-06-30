[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / getMinimumBorrowAmount

# Function: getMinimumBorrowAmount()

> **getMinimumBorrowAmount**(`asset`): `bigint`

Defined in: [packages/client/src/core/borrow-minimums.ts:31](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/borrow-minimums.ts#L31)

Returns the minimum borrow amount for an asset in base units.

Assets without a configured product minimum return `0n`.

## Parameters

### asset

`string`

## Returns

`bigint`
