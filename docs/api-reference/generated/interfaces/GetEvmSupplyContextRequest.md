[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetEvmSupplyContextRequest

# Interface: GetEvmSupplyContextRequest

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:294](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L294)

Request for ERC-20 approval and deposit planning.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:304](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L304)

Deposit or repayment action for the inflow.

***

### amount

> **amount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:302](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L302)

Supply amount in token base units.

***

### poolId

> **poolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:298](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L298)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:296](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L296)

Liquidium profile principal text.

***

### walletAddress

> **walletAddress**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:300](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L300)

EVM wallet address that will send funds.
