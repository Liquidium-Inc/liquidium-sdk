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

Defined in: [packages/client/src/modules/lending/types.ts:228](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L228)

Sender EVM wallet address.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:181](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L181)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:230](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L230)

Amount in token base units. Deposits enforce the asset product minimum.

***

### chain

> **chain**: `"ETH"`

Defined in: [packages/client/src/modules/lending/types.ts:224](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L224)

Contract interaction is supported for native ETH, USDC, and USDT pools on Ethereum.

#### Overrides

`BaseSupplyFlowRequest.chain`

***

### mechanism

> **mechanism**: `"contractInteraction"`

Defined in: [packages/client/src/modules/lending/types.ts:222](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L222)

Contract-interaction mechanism discriminator.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:180](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L180)

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:179](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L179)

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendEthTransaction"`\>

Defined in: [packages/client/src/modules/lending/types.ts:226](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L226)

ETH wallet adapter used to deposit native ETH or approve and deposit ERC-20 assets.
