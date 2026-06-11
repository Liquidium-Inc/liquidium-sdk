[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindCollateral

# Interface: InstantLoanFindCollateral

Defined in: [packages/client/src/modules/instant-loans/types.ts:154](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L154)

Collateral leg returned by instant-loan search.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:160](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L160)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:158](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L158)

Asset the user deposits as collateral.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:156](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L156)

Principal text of the collateral pool.
