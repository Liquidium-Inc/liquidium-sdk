[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindCollateral

# Interface: InstantLoanFindCollateral

Defined in: [packages/client/src/modules/instant-loans/types.ts:177](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L177)

Collateral leg returned by instant-loan search.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:183](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L183)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:181](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L181)

Asset the user deposits as collateral.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:179](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L179)

Principal text of the collateral pool.
