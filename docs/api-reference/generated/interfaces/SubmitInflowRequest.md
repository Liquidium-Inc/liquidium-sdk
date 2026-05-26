[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitInflowRequest

# Interface: SubmitInflowRequest

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:262](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L262)

Body for `SupplyFlow.submit` / `lending.submitInflow`.

## Properties

### chain?

> `optional` **chain?**: [`Chain`](../type-aliases/Chain.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:266](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L266)

Chain where the transaction was broadcast, when not implied by the flow.

***

### txid

> **txid**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:264](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L264)

Broadcast transaction id or hash.

***

### type?

> `optional` **type?**: [`InflowSubmitType`](../type-aliases/InflowSubmitType.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:268](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L268)

Deposit or repayment submit type, when not implied by the flow.
