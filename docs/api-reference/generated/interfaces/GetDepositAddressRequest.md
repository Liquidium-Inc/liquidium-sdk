[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetDepositAddressRequest

# Interface: GetDepositAddressRequest

Defined in: [packages/client/src/modules/lending/types.ts:297](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L297)

Request for a native ETH or ETH stablecoin deposit address.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:305](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L305)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `"ETH"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/lending/types.ts:303](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L303)

Native ETH or ETH stablecoin asset.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:301](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L301)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:299](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L299)

Liquidium profile principal text.
