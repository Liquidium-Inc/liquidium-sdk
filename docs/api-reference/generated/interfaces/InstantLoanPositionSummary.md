[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanPositionSummary

# Interface: InstantLoanPositionSummary

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:250](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L250)

Current lending position backing the instant loan.

## Properties

### borrowedAmount

> **borrowedAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:258](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L258)

Borrowed principal in the borrow asset's base units.

***

### borrowedDecimals

> **borrowedDecimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:260](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L260)

Decimal scale for borrowed/debt amounts.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:252](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L252)

Current collateral amount in the collateral asset's base units.

***

### collateralDecimals

> **collateralDecimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:254](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L254)

Decimal scale for `collateralAmount`.

***

### collateralInterestAmount

> **collateralInterestAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:256](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L256)

Earned interest on the collateral side in base units.

***

### debtInterestAmount

> **debtInterestAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:262](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L262)

Accrued borrow interest in base units.

***

### totalDebtAmount

> **totalDebtAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:264](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L264)

Borrowed principal plus accrued interest in base units, before repayment buffer.
