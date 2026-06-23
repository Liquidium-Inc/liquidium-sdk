[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanPositionSummary

# Interface: InstantLoanPositionSummary

Defined in: [packages/client/src/modules/instant-loans/types.ts:385](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L385)

Current lending position backing the instant loan.

## Properties

### borrowedAmount

> **borrowedAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:393](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L393)

Borrowed principal in the borrow asset's base units.

***

### borrowedDecimals

> **borrowedDecimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:395](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L395)

Decimal scale for borrowed/debt amounts.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:387](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L387)

Current collateral amount in the collateral asset's base units.

***

### collateralDecimals

> **collateralDecimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:389](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L389)

Decimal scale for `collateralAmount`.

***

### collateralInterestAmount

> **collateralInterestAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:391](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L391)

Earned interest on the collateral side in base units.

***

### debtInterestAmount

> **debtInterestAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:397](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L397)

Accrued borrow interest in base units.

***

### totalDebtAmount

> **totalDebtAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:399](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L399)

Borrowed principal plus accrued interest in base units, before repayment buffer.
