[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SupplyTarget

# Type Alias: SupplyTarget

> **SupplyTarget** = [`AssetIdentifier`](AssetIdentifier.md) & `object`

Defined in: [packages/client/src/modules/lending/types.ts:167](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L167)

Supply destination returned by `lending.supply(...)`.

## Type Declaration

### action

> **action**: [`SupplyAction`](SupplyAction.md)

Deposit or repayment action for the inflow.

### address

> **address**: `string`

Address to use for this chain and asset pair.

### icpAccountIdentifier?

> `optional` **icpAccountIdentifier?**: `string`

Legacy account identifier for ICP ledger transfers.

### poolId

> **poolId**: `string`

Pool principal text receiving the inflow.
