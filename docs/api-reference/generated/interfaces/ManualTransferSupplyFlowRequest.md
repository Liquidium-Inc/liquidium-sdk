[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ManualTransferSupplyFlowRequest

# Interface: ManualTransferSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:187](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L187)

Manual transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account?

> `optional` **account?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:193](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L193)

Disallowed for manual transfer flows.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:183](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L183)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount?

> `optional` **amount?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:195](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L195)

Disallowed for manual transfer flows.

***

### mechanism?

> `optional` **mechanism?**: `"transfer"`

Defined in: [packages/client/src/modules/lending/types.ts:189](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L189)

Optional explicit transfer mechanism.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:182](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L182)

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:181](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L181)

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter?

> `optional` **walletAdapter?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:191](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L191)

Disallowed for manual transfer flows.
