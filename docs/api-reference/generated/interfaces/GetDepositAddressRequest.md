[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetDepositAddressRequest

# Interface: GetDepositAddressRequest

Defined in: [packages/client/src/modules/lending/types.ts:294](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L294)

Request for an ETH stablecoin deposit address.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:302](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L302)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/lending/types.ts:300](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L300)

ETH stablecoin asset.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:298](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L298)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:296](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L296)

Liquidium profile principal text.
