[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ContractInteractionSupplyFlowRequest

# Interface: ContractInteractionSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:283](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L283)

Input for contract-interaction `lending.supply`, which always executes now.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:290](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L290)

Sender EVM wallet address.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:247](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L247)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:292](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L292)

Deposit or repayment amount in token base units.

***

### mechanism

> **mechanism**: `"contractInteraction"`

Defined in: [packages/client/src/modules/lending/types.ts:286](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L286)

Contract-interaction mechanism discriminator.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:246](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L246)

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:245](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L245)

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendEthTransaction"`\>

Defined in: [packages/client/src/modules/lending/types.ts:288](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L288)

ETH wallet adapter used to approve and deposit ERC-20 assets.
