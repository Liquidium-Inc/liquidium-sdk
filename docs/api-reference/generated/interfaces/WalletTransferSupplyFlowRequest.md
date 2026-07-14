[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletTransferSupplyFlowRequest

# Interface: WalletTransferSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:196](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L196)

Wallet-executed transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:205](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L205)

Sender wallet account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:178](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L178)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:207](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L207)

Transfer amount in the target asset's base units.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:180](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L180)

Transfer chain to use. Pass ICP for ck-ledger transfers.

#### Inherited from

`BaseSupplyFlowRequest.chain`

***

### mechanism?

> `optional` **mechanism?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:198](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L198)

Transfer supply uses the default mechanism and does not accept this field.

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

> **walletAdapter**: `Pick`\<[`WalletAdapter`](WalletAdapter.md), `"sendBtcTransaction"` \| `"sendEthTransaction"` \| `"sendIcrcTransfer"`\>

Defined in: [packages/client/src/modules/lending/types.ts:200](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L200)

Wallet adapter used to broadcast the transfer.
