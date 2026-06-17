[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitSupplyFlowInflowRequest

# Interface: SubmitSupplyFlowInflowRequest

Defined in: [packages/client/src/modules/lending/types.ts:308](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L308)

Body for `SupplyFlow.submit`. The supply flow supplies the inflow operation.

## Extended by

- [`SubmitInflowRequest`](SubmitInflowRequest.md)

## Properties

### chain?

> `optional` **chain?**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:312](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L312)

Chain where the transaction was broadcast, when not implied by the flow.

***

### txid

> **txid**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:310](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L310)

Broadcast transaction id or hash.
