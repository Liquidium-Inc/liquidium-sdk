[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanCollateral

# Interface: InstantLoanCollateral

Defined in: [packages/client/src/modules/instant-loans/types.ts:411](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L411)

Collateral leg selected for an instant loan.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:421](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L421)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:415](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L415)

Collateral asset symbol.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:417](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L417)

Chain used for collateral deposits.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:419](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L419)

Decimal scale for collateral amounts.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:413](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L413)

Principal text of the collateral pool.
