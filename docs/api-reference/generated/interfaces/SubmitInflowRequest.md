[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitInflowRequest

# Interface: SubmitInflowRequest

Defined in: packages/client/src/modules/lending/types.ts:282

Body for direct `lending.submitInflow`.

## Extends

- [`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md)

## Properties

### chain?

> `optional` **chain?**: `"BTC"` \| `"ETH"`

Defined in: packages/client/src/modules/lending/types.ts:278

Chain where the transaction was broadcast, when not implied by the flow.

#### Inherited from

[`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md).[`chain`](SubmitSupplyFlowInflowRequest.md#chain)

***

### operation

> **operation**: [`InflowOperation`](../type-aliases/InflowOperation.md)

Defined in: packages/client/src/modules/lending/types.ts:284

Deposit or repayment operation represented by the transaction.

***

### txid

> **txid**: `string`

Defined in: packages/client/src/modules/lending/types.ts:276

Broadcast transaction id or hash.

#### Inherited from

[`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md).[`txid`](SubmitSupplyFlowInflowRequest.md#txid)
