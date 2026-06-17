[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ManualTransferSupplyFlowRequest

# Interface: ManualTransferSupplyFlowRequest

Defined in: [packages/client/src/modules/lending/types.ts:225](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L225)

Manual transfer-based `lending.supply` request.

## Extends

- `BaseSupplyFlowRequest`

## Properties

### account?

> `optional` **account?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:231](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L231)

Disallowed for manual transfer flows.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:221](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L221)

#### Inherited from

`BaseSupplyFlowRequest.action`

***

### amount?

> `optional` **amount?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:233](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L233)

Disallowed for manual transfer flows.

***

### mechanism?

> `optional` **mechanism?**: `"transfer"`

Defined in: [packages/client/src/modules/lending/types.ts:227](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L227)

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

### walletAdapter?

> `optional` **walletAdapter?**: `undefined`

Defined in: [packages/client/src/modules/lending/types.ts:229](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L229)

Disallowed for manual transfer flows.
