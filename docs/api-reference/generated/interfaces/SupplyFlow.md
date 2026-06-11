[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SupplyFlow

# Interface: SupplyFlow

Defined in: [packages/client/src/modules/lending/types.ts:289](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L289)

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

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/lending/types.ts:297](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L297)

Shared lifecycle status for the supply flow.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/lending/types.ts:293](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L293)

Destination where funds should be sent or were sent.

***

### txid?

> `optional` **txid?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:295](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L295)

Transaction id when the SDK broadcast the transaction.

***

### type

> **type**: [`SupplyPlanType`](../type-aliases/SupplyPlanType.md)

Defined in: [packages/client/src/modules/lending/types.ts:291](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L291)

Execution plan used by the supply flow.

## Methods

### submit()

> **submit**(`request`): `Promise`\<[`SubmitInflowResponse`](SubmitInflowResponse.md)\>

Defined in: [packages/client/src/modules/lending/types.ts:299](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L299)

Registers a broadcast transaction id when the flow requires an indexing hint.

#### Parameters

##### request

[`SubmitInflowRequest`](SubmitInflowRequest.md)

#### Returns

`Promise`\<[`SubmitInflowResponse`](SubmitInflowResponse.md)\>
