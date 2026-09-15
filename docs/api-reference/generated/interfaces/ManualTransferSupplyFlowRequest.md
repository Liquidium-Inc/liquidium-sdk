[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ManualTransferSupplyFlowRequest

# Interface: ManualTransferSupplyFlowRequest

Defined in: packages/client/src/modules/lending/types.ts:187

Manual transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account?

> `optional` **account?**: `undefined`

Defined in: packages/client/src/modules/lending/types.ts:193

Manual supply does not accept a sender account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: packages/client/src/modules/lending/types.ts:181

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount?

> `optional` **amount?**: `undefined`

Defined in: packages/client/src/modules/lending/types.ts:195

Manual supply does not accept an execution amount.

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

Defined in: packages/client/src/modules/lending/types.ts:189

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

### walletAdapter?

> `optional` **walletAdapter?**: `undefined`

Defined in: packages/client/src/modules/lending/types.ts:191

Manual supply does not broadcast through a wallet adapter.
