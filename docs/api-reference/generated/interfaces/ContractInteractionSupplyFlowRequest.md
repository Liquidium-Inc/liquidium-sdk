[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ContractInteractionSupplyFlowRequest

# Interface: ContractInteractionSupplyFlowRequest

Defined in: packages/client/src/modules/lending/types.ts:219

Input for contract-interaction `lending.supply`, which always executes now.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account

> **account**: `string`

Defined in: packages/client/src/modules/lending/types.ts:228

Sender EVM wallet address.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: packages/client/src/modules/lending/types.ts:181

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:230

Amount in token base units. Deposits enforce the asset product minimum.

***

### chain

> **chain**: `"ETH"`

Defined in: packages/client/src/modules/lending/types.ts:224

Contract interaction is supported for native ETH, USDC, and USDT pools on Ethereum.

#### Overrides

`BaseSupplyFlowRequest.chain`

***

### mechanism

> **mechanism**: `"contractInteraction"`

Defined in: packages/client/src/modules/lending/types.ts:222

Contract-interaction mechanism discriminator.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:180

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:179

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendEthTransaction"`\>

Defined in: packages/client/src/modules/lending/types.ts:226

ETH wallet adapter used to deposit native ETH or approve and deposit ERC-20 assets.
