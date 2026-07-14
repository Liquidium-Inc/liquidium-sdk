[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ManualTransferSupplyFlowRequest

# Interface: ManualTransferSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:184](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L184)

Manual transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account?

> `optional` **account?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:190](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L190)

Manual supply does not accept a sender account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:178](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L178)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount?

> `optional` **amount?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:192](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L192)

Manual supply does not accept an execution amount.

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

Defined in: [packages/client/src/modules/lending/types.ts:186](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L186)

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

### walletAdapter?

> `optional` **walletAdapter?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:188](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L188)

Manual supply does not broadcast through a wallet adapter.
