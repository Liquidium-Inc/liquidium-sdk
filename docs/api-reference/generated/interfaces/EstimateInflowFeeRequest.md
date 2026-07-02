[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EstimateInflowFeeRequest

# Interface: EstimateInflowFeeRequest

Defined in: [packages/client/src/modules/lending/types.ts:435](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L435)

Request for estimating the fee needed for an inflow target.

## Properties

### asset

> **asset**: [`Asset`](../type-aliases/Asset.md)

Defined in: [packages/client/src/modules/lending/types.ts:437](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L437)

Asset to estimate for.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:439](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L439)

Chain to estimate for.

***

### mechanism?

> `optional` **mechanism?**: [`SupplyPlanType`](../type-aliases/SupplyPlanType.md)

Defined in: [packages/client/src/modules/lending/types.ts:443](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L443)

Supply mechanism to estimate when callers need to disambiguate.

***

### transferMode?

> `optional` **transferMode?**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/modules/lending/types.ts:441](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L441)

Asset transfer path to estimate. Defaults preserve existing native flows.
