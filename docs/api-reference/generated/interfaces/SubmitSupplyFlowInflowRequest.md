[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitSupplyFlowInflowRequest

# Interface: SubmitSupplyFlowInflowRequest

Defined in: [packages/client/src/modules/lending/types.ts:336](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L336)

Body for `SupplyFlow.submit`. The supply flow supplies the inflow operation.

## Extended by

- [`SubmitInflowRequest`](SubmitInflowRequest.md)

## Properties

### chain?

> `optional` **chain?**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:340](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L340)

Chain where the transaction was broadcast, when not implied by the flow.

***

### txid

> **txid**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:338](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L338)

Broadcast transaction id or hash.
