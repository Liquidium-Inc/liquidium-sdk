[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetDepositAddressRequest

# Interface: GetDepositAddressRequest

Defined in: packages/client/src/modules/lending/types.ts:384

Request for a native ETH or ETH stablecoin deposit address.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: packages/client/src/modules/lending/types.ts:392

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `"ETH"` \| `"USDC"` \| `"USDT"`

Defined in: packages/client/src/modules/lending/types.ts:390

Native ETH or ETH stablecoin asset.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:388

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:386

Liquidium profile principal text.
