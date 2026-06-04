[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetDepositAddressRequest

# Interface: GetDepositAddressRequest

Defined in: [packages/client/src/modules/lending/types.ts:322](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L322)

Request for an ETH stablecoin deposit address.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:330](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L330)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:328](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L328)

ETH stablecoin asset.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:326](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L326)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:324](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L324)

Liquidium profile principal text.
