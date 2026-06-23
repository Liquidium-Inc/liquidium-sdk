[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitInflowRequest

# Interface: SubmitInflowRequest

Defined in: [packages/client/src/modules/lending/types.ts:343](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L343)

Body for direct `lending.submitInflow`.

## Extends

- [`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md)

## Properties

### chain?

> `optional` **chain?**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:339](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L339)

Chain where the transaction was broadcast, when not implied by the flow.

#### Inherited from

[`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md).[`chain`](SubmitSupplyFlowInflowRequest.md#chain)

***

### operation

> **operation**: [`InflowOperation`](../type-aliases/InflowOperation.md)

Defined in: [packages/client/src/modules/lending/types.ts:345](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L345)

Deposit or repayment operation represented by the transaction.

***

### txid

> **txid**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:337](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L337)

Broadcast transaction id or hash.

#### Inherited from

[`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md).[`txid`](SubmitSupplyFlowInflowRequest.md#txid)
