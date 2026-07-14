[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetEvmSupplyContextRequest

# Interface: GetEvmSupplyContextRequest

Defined in: [packages/client/src/modules/lending/types.ts:312](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L312)

Request for ERC-20 approval and deposit planning.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:322](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L322)

Deposit or repayment action for the inflow.

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:320](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L320)

Supply amount in token base units.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:316](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L316)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:314](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L314)

Liquidium profile principal text.

***

### walletAddress

> **walletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:318](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L318)

EVM wallet address that will send funds.
