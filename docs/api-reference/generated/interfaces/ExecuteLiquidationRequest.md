[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ExecuteLiquidationRequest

# Interface: ExecuteLiquidationRequest

Defined in: packages/client/src/modules/liquidations/types.ts:61

Fields required to execute a liquidation.

## Properties

### borrowerProfileId

> **borrowerProfileId**: `string`

Defined in: packages/client/src/modules/liquidations/types.ts:63

Liquidium profile principal that owns the position.

***

### buyBadDebt?

> `optional` **buyBadDebt?**: `boolean`

Defined in: packages/client/src/modules/liquidations/types.ts:83

Allow repayment beyond what collateral can cover, including zero collateral.
Defaults to `false`. Does not force a bad-debt or hybrid path.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: packages/client/src/modules/liquidations/types.ts:67

Principal of the pool that contains the collateral.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:69

Debt offered for repayment in debt-asset base units.

***

### debtPoolId

> **debtPoolId**: `string`

Defined in: packages/client/src/modules/liquidations/types.ts:65

Principal of the pool that contains the debt.

***

### minCollateralAmount

> **minCollateralAmount**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:78

Minimum gross collateral in collateral-asset base units, before transfer fees.
Required, but the canister enforces it only on bad-debt and hybrid paths.
Normal collateral-backed liquidations ignore it and can fill smaller amounts,
even with `buyBadDebt: true`. Zero disables the guard where it applies.

***

### receiverPrincipal

> **receiverPrincipal**: `string`

Defined in: packages/client/src/modules/liquidations/types.ts:71

Principal that receives seized collateral.
