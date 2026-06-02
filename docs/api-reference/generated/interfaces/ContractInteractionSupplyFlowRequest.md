[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ContractInteractionSupplyFlowRequest

# Interface: ContractInteractionSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:219](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L219)

Input for contract-interaction `lending.supply`, which always executes now.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:226](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L226)

Sender EVM wallet address.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:183](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L183)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:228](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L228)

Deposit or repayment amount in token base units.

***

### mechanism

> **mechanism**: `"contractInteraction"`

Defined in: [packages/client/src/modules/lending/types.ts:222](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L222)

Contract-interaction mechanism discriminator.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:182](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L182)

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:181](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L181)

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendEthTransaction"`\>

Defined in: [packages/client/src/modules/lending/types.ts:224](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L224)

ETH wallet adapter used to approve and deposit ERC-20 assets.
