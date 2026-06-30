[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ManualTransferSupplyFlowRequest

# Interface: ManualTransferSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:251](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L251)

Manual transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account?

> `optional` **account?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:257](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L257)

Disallowed for manual transfer flows.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:247](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L247)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount?

> `optional` **amount?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:259](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L259)

Disallowed for manual transfer flows.

***

### mechanism?

> `optional` **mechanism?**: `"transfer"`

Defined in: [packages/client/src/modules/lending/types.ts:253](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L253)

Optional explicit transfer mechanism.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:246](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L246)

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:245](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L245)

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter?

> `optional` **walletAdapter?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:255](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L255)

Disallowed for manual transfer flows.
