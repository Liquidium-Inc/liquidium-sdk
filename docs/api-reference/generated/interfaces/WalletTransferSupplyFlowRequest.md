[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletTransferSupplyFlowRequest

# Interface: WalletTransferSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:237](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L237)

Wallet-executed transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:246](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L246)

Sender wallet account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:221](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L221)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:248](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L248)

Transfer amount in the target asset's base units.

***

### mechanism?

> `optional` **mechanism?**: `"transfer"`

Defined in: [packages/client/src/modules/lending/types.ts:239](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L239)

Optional explicit transfer mechanism.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:220](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L220)

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:219](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L219)

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendBtcTransaction"` \| `"sendEthTransaction"`\>

Defined in: [packages/client/src/modules/lending/types.ts:241](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L241)

Wallet adapter used to broadcast the transfer.
