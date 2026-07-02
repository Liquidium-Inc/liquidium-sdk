[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindCollateral

# Interface: InstantLoanFindCollateral

Defined in: [packages/client/src/modules/instant-loans/types.ts:178](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L178)

Collateral leg returned by instant-loan search.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:184](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L184)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:182](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L182)

Asset the user deposits as collateral.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:180](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L180)

Principal text of the collateral pool.
