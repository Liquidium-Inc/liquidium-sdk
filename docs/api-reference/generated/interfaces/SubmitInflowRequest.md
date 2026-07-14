[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitInflowRequest

# Interface: SubmitInflowRequest

Defined in: [packages/client/src/modules/lending/types.ts:279](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L279)

Body for direct `lending.submitInflow`.

## Extends

- [`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md)

## Properties

### chain?

> `optional` **chain?**: `"BTC"` \| `"ETH"`

Defined in: [packages/client/src/modules/lending/types.ts:275](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L275)

Chain where the transaction was broadcast, when not implied by the flow.

#### Inherited from

[`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md).[`chain`](SubmitSupplyFlowInflowRequest.md#chain)

***

### operation

> **operation**: [`InflowOperation`](../type-aliases/InflowOperation.md)

Defined in: [packages/client/src/modules/lending/types.ts:281](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L281)

Deposit or repayment operation represented by the transaction.

***

### txid

> **txid**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:273](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L273)

Broadcast transaction id or hash.

#### Inherited from

[`SubmitSupplyFlowInflowRequest`](SubmitSupplyFlowInflowRequest.md).[`txid`](SubmitSupplyFlowInflowRequest.md#txid)
