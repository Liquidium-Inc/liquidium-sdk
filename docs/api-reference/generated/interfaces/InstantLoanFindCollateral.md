[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindCollateral

# Interface: InstantLoanFindCollateral

Defined in: [packages/client/src/modules/instant-loans/types.ts:199](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L199)

Collateral leg returned by instant-loan search.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:205](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L205)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:203](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L203)

Asset the user deposits as collateral.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:201](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L201)

Principal text of the collateral pool.
