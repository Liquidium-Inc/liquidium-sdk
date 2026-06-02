[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SupplyFlow

# Interface: SupplyFlow

Defined in: [packages/client/src/modules/lending/types.ts:250](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L250)

Supply receipt returned by `lending.supply(...)`.

- `txid` is populated when the SDK broadcast the transaction on your behalf
  (wallet-adapter path). When undefined, the caller is expected to broadcast
  themselves and call [SupplyFlow.submit](#submit) for flows that require txid
  registration.
- `submit` registers a broadcast txid with the SDK API when needed. ETH
  stablecoin deposit-address transfers are indexed from ERC-20 transfer logs,
  so `submit` acknowledges the txid without posting it to the inflow endpoint.

The SDK does not poll inflow status. When you have a `txid`, it is your
responsibility to track confirmation state with your own polling.

## Properties

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/lending/types.ts:254](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L254)

Destination where funds should be sent or were sent.

***

### txid?

> `optional` **txid?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:256](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L256)

Transaction id when the SDK broadcast the transaction.

***

### type

> **type**: [`SupplyPlanType`](../type-aliases/SupplyPlanType.md)

Defined in: [packages/client/src/modules/lending/types.ts:252](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L252)

Execution plan used by the supply flow.

## Methods

### submit()

> **submit**(`request`): `Promise`\<[`SubmitInflowResponse`](SubmitInflowResponse.md)\>

Defined in: [packages/client/src/modules/lending/types.ts:258](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L258)

Registers a broadcast transaction id when the flow requires an indexing hint.

#### Parameters

##### request

[`SubmitInflowRequest`](SubmitInflowRequest.md)

#### Returns

`Promise`\<[`SubmitInflowResponse`](SubmitInflowResponse.md)\>
