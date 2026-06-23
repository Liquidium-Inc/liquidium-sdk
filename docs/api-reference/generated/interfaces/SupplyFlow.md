[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SupplyFlow

# Interface: SupplyFlow

Defined in: [packages/client/src/modules/lending/types.ts:315](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L315)

Supply receipt returned by `lending.supply(...)`.

- `txid` is populated when the SDK broadcast the transaction on your behalf
  (wallet-adapter path). When undefined, the caller is expected to broadcast
  themselves and call [SupplyFlow.submit](#submit) for flows that require txid
  registration.
- If post-broadcast inflow registration fails after the SDK broadcasts the
  transaction, `txid` is still returned so callers can track the transaction.
- `submit` registers a broadcast txid with the SDK API when needed. ETH
  stablecoin deposit-address transfers are indexed from ERC-20 transfer logs,
  so `submit` acknowledges the txid without posting it to the inflow endpoint.

The SDK does not poll inflow status. When you have a `txid`, it is your
responsibility to track confirmation state with your own polling.

## Properties

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/lending/types.ts:323](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L323)

Shared lifecycle status for the supply flow.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/lending/types.ts:319](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L319)

Destination where funds should be sent or were sent.

***

### txid?

> `optional` **txid?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:321](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L321)

Transaction id when the SDK broadcast the transaction.

***

### type

> **type**: [`SupplyPlanType`](../type-aliases/SupplyPlanType.md)

Defined in: [packages/client/src/modules/lending/types.ts:317](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L317)

Execution plan used by the supply flow.

## Methods

### submit()

> **submit**(`request`): `Promise`\<[`SubmitInflowResponse`](SubmitInflowResponse.md)\>

Defined in: [packages/client/src/modules/lending/types.ts:325](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L325)

Registers a broadcast transaction id when the flow requires an indexing hint.

#### Parameters

##### request

[`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md)

#### Returns

`Promise`\<[`SubmitInflowResponse`](SubmitInflowResponse.md)\>
