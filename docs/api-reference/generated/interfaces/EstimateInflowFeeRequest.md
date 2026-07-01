[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EstimateInflowFeeRequest

# Interface: EstimateInflowFeeRequest

Defined in: [packages/client/src/modules/lending/types.ts:405](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L405)

Request for estimating the fee needed for an inflow target.

## Properties

### asset

> **asset**: [`Asset`](../type-aliases/Asset.md)

Defined in: [packages/client/src/modules/lending/types.ts:407](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L407)

Asset to estimate for.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:409](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L409)

Chain to estimate for.

***

### mechanism?

> `optional` **mechanism?**: [`SupplyPlanType`](../type-aliases/SupplyPlanType.md)

Defined in: [packages/client/src/modules/lending/types.ts:413](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L413)

Supply mechanism to estimate when callers need to disambiguate.

***

### transferMode?

> `optional` **transferMode?**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/modules/lending/types.ts:411](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L411)

Asset transfer path to estimate. Defaults preserve existing native flows.
