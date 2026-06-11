[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletTransferSupplyFlowRequest

# Interface: WalletTransferSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:238](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L238)

Wallet-executed transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:247](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L247)

Sender wallet account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:222](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L222)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:249](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L249)

Transfer amount in the target asset's base units.

***

### mechanism?

> `optional` **mechanism?**: `"transfer"`

Defined in: [packages/client/src/modules/lending/types.ts:240](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L240)

Optional explicit transfer mechanism.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:221](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L221)

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:220](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L220)

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendBtcTransaction"` \| `"sendEthTransaction"`\>

Defined in: [packages/client/src/modules/lending/types.ts:242](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L242)

Wallet adapter used to broadcast the transfer.
