[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanPositionSummary

# Interface: SimpleLoanPositionSummary

Defined in: [packages/client/src/modules/simple-loans/types.ts:421](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L421)

Current lending position backing the simple loan.

## Properties

### borrowedAmount

> **borrowedAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:429](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L429)

Borrowed principal in the borrow asset's base units.

***

### borrowedDecimals

> **borrowedDecimals**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:431](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L431)

Decimal scale for borrowed/debt amounts.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:423](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L423)

Current collateral amount in the collateral asset's base units.

***

### collateralDecimals

> **collateralDecimals**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:425](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L425)

Decimal scale for `collateralAmount`.

***

### collateralInterestAmount

> **collateralInterestAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:427](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L427)

Earned interest on the collateral side in base units.

***

### debtInterestAmount

> **debtInterestAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:433](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L433)

Accrued borrow interest in base units.

***

### totalDebtAmount

> **totalDebtAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:435](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L435)

Borrowed principal plus accrued interest in base units, before repayment buffer.
