[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitSupplyFlowInflowRequest

# Interface: SubmitSupplyFlowInflowRequest

Defined in: [packages/client/src/modules/lending/types.ts:271](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L271)

Body for `SupplyFlow.submit`. The supply flow supplies the inflow operation.

## Extended by

- [`SubmitInflowRequest`](SubmitInflowRequest.md)

## Properties

### chain?

> `optional` **chain?**: `"BTC"` \| `"ETH"`

Defined in: [packages/client/src/modules/lending/types.ts:275](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L275)

Chain where the transaction was broadcast, when not implied by the flow.

***

### txid

> **txid**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:273](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L273)

Broadcast transaction id or hash.
