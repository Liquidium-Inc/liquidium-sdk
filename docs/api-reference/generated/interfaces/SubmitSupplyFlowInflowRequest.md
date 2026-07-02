[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitSupplyFlowInflowRequest

# Interface: SubmitSupplyFlowInflowRequest

Defined in: [packages/client/src/modules/lending/types.ts:415](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L415)

Body for `SupplyFlow.submit`. The supply flow supplies the inflow operation.

## Extended by

- [`SubmitInflowRequest`](SubmitInflowRequest.md)

## Properties

### chain?

> `optional` **chain?**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:419](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L419)

Chain where the transaction was broadcast, when not implied by the flow.

***

### txid

> **txid**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:417](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L417)

Broadcast transaction id or hash.
