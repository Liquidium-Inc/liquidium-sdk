[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SupplyFlow

# Interface: SupplyFlow

Defined in: [packages/client/src/modules/lending/types.ts:316](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L316)

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

Defined in: [packages/client/src/modules/lending/types.ts:324](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L324)

Shared lifecycle status for the supply flow.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/lending/types.ts:320](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L320)

Destination where funds should be sent or were sent.

***

### txid?

> `optional` **txid?**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:322](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L322)

Transaction id when the SDK broadcast the transaction.

***

### type

> **type**: [`SupplyPlanType`](../type-aliases/SupplyPlanType.md)

Defined in: [packages/client/src/modules/lending/types.ts:318](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L318)

Execution plan used by the supply flow.

## Methods

### submit()

> **submit**(`request`): `Promise`\<[`SubmitInflowResponse`](SubmitInflowResponse.md)\>

Defined in: [packages/client/src/modules/lending/types.ts:326](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L326)

Registers a broadcast transaction id when the flow requires an indexing hint.

#### Parameters

##### request

[`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md)

#### Returns

`Promise`\<[`SubmitInflowResponse`](SubmitInflowResponse.md)\>
