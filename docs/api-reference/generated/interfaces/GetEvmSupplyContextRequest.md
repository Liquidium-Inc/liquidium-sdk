[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetEvmSupplyContextRequest

# Interface: GetEvmSupplyContextRequest

Defined in: [packages/client/src/modules/lending/types.ts:385](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L385)

Request for ERC-20 approval and deposit planning.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:395](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L395)

Deposit or repayment action for the inflow.

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:393](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L393)

Supply amount in token base units.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:389](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L389)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:387](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L387)

Liquidium profile principal text.

***

### walletAddress

> **walletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:391](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L391)

EVM wallet address that will send funds.
