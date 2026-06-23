[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetDepositAddressRequest

# Interface: GetDepositAddressRequest

Defined in: [packages/client/src/modules/lending/types.ts:363](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L363)

Request for an ETH stablecoin deposit address.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:371](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L371)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:369](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L369)

ETH stablecoin asset.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:367](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L367)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:365](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L365)

Liquidium profile principal text.
