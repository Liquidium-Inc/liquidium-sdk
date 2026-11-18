[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletTransferSupplyFlowRequest

# Interface: WalletTransferSupplyFlowRequest

Defined in: packages/client/src/modules/lending/types.ts:269

Wallet-executed transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account

> **account**: `string`

Defined in: packages/client/src/modules/lending/types.ts:281

Sender wallet account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: packages/client/src/modules/lending/types.ts:251

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:283

Transfer amount in base units. Deposits enforce the asset product minimum.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/lending/types.ts:253

Transfer chain to use. Pass ICP for ck-ledger transfers.

#### Inherited from

`BaseSupplyFlowRequest.chain`

***

### mechanism?

> `optional` **mechanism?**: `"transfer"`

Defined in: packages/client/src/modules/lending/types.ts:271

Explicit transfer mechanism. Omit this field to use the same default.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:250

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:249

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendBtcTransaction"` \| `"sendEthTransaction"` \| `"sendIcrcTransfer"` \| `"sendSolTransaction"`\>

Defined in: packages/client/src/modules/lending/types.ts:273

Wallet adapter used to broadcast the transfer.
