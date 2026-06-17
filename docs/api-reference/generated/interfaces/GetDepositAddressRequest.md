[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetDepositAddressRequest

# Interface: GetDepositAddressRequest

Defined in: [packages/client/src/modules/lending/types.ts:340](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L340)

Request for an ETH stablecoin deposit address.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:348](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L348)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:346](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L346)

ETH stablecoin asset.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:344](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L344)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:342](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L342)

Liquidium profile principal text.
