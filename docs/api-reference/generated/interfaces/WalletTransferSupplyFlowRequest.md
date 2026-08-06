[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletTransferSupplyFlowRequest

# Interface: WalletTransferSupplyFlowRequest

Defined in: packages/client/src/modules/lending/types.ts:199

Wallet-executed transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account

> **account**: `string`

Defined in: packages/client/src/modules/lending/types.ts:208

Sender wallet account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: packages/client/src/modules/lending/types.ts:181

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:210

Transfer amount in base units. Deposits enforce the asset product minimum.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/lending/types.ts:183

Transfer chain to use. Pass ICP for ck-ledger transfers.

#### Inherited from

`BaseSupplyFlowRequest.chain`

***

### mechanism?

> `optional` **mechanism?**: `"transfer"`

Defined in: packages/client/src/modules/lending/types.ts:201

Explicit transfer mechanism. Omit this field to use the same default.

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

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendBtcTransaction"` \| `"sendEthTransaction"` \| `"sendIcrcTransfer"`\>

Defined in: packages/client/src/modules/lending/types.ts:203

Wallet adapter used to broadcast the transfer.
