[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ContractInteractionSupplyFlowRequest

# Interface: ContractInteractionSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:216](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L216)

Input for contract-interaction `lending.supply`, which always executes now.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:225](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L225)

Sender EVM wallet address.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:178](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L178)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:227](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L227)

Deposit or repayment amount in token base units.

***

### chain

> **chain**: `"ETH"`

Defined in: [packages/client/src/modules/lending/types.ts:221](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L221)

Contract interaction is only supported for ETH stablecoin pools.

#### Overrides

`BaseSupplyFlowRequest.chain`

***

### mechanism

> **mechanism**: `"contractInteraction"`

Defined in: [packages/client/src/modules/lending/types.ts:219](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L219)

Contract-interaction mechanism discriminator.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:177](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L177)

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:176](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L176)

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendEthTransaction"`\>

Defined in: [packages/client/src/modules/lending/types.ts:223](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L223)

ETH wallet adapter used to approve and deposit ERC-20 assets.
