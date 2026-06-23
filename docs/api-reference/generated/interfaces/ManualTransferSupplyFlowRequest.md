[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ManualTransferSupplyFlowRequest

# Interface: ManualTransferSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:250](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L250)

Manual transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account?

> `optional` **account?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:256](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L256)

Disallowed for manual transfer flows.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:246](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L246)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount?

> `optional` **amount?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:258](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L258)

Disallowed for manual transfer flows.

***

### mechanism?

> `optional` **mechanism?**: `"transfer"`

Defined in: [packages/client/src/modules/lending/types.ts:252](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L252)

Optional explicit transfer mechanism.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:245](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L245)

#### Inherited from

`BaseSupplyFlowRequest.poolId`

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:244](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L244)

#### Inherited from

`BaseSupplyFlowRequest.profileId`

***

### walletAdapter?

> `optional` **walletAdapter?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:254](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L254)

Disallowed for manual transfer flows.
