[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetEvmSupplyContextRequest

# Interface: GetEvmSupplyContextRequest

Defined in: packages/client/src/modules/lending/types.ts:406

Request for ERC-20 approval and deposit planning.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: packages/client/src/modules/lending/types.ts:416

Deposit or repayment action for the inflow.

***

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:414

Supply amount in token base units.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:410

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:408

Liquidium profile principal text.

***

### walletAddress

> **walletAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:412

EVM wallet address that will send funds.
