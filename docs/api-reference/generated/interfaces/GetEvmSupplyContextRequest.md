[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetEvmSupplyContextRequest

# Interface: GetEvmSupplyContextRequest

Defined in: [packages/client/src/modules/lending/types.ts:358](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L358)

Request for ERC-20 approval and deposit planning.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:368](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L368)

Deposit or repayment action for the inflow.

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:366](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L366)

Supply amount in token base units.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:362](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L362)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:360](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L360)

Liquidium profile principal text.

***

### walletAddress

> **walletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:364](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L364)

EVM wallet address that will send funds.
