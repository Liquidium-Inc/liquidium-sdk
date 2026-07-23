[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanBorrow

# Type Alias: SimpleLoanBorrow

> **SimpleLoanBorrow** = [`AssetIdentifier`](AssetIdentifier.md) & `object`

Defined in: [packages/client/src/modules/simple-loans/types.ts:429](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L429)

Borrow leg selected for a simple loan.

## Type Declaration

### amount

> **amount**: `bigint`

Requested borrow amount in base units.

### decimals

> **decimals**: `bigint`

Decimal scale for borrow and debt amounts.

### destination

> **destination**: [`SimpleLoanAccount`](SimpleLoanAccount.md)

Destination that receives the borrowed asset.

### poolId

> **poolId**: `string`

Principal text of the borrow pool.
