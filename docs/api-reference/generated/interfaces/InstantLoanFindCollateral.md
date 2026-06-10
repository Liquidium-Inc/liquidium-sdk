[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindCollateral

# Interface: InstantLoanFindCollateral

Defined in: [packages/client/src/modules/instant-loans/types.ts:153](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L153)

Collateral leg returned by instant-loan search.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:159](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L159)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:157](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L157)

Asset the user deposits as collateral.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:155](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L155)

Principal text of the collateral pool.
