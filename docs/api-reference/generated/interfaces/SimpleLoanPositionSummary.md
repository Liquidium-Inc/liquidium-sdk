[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanPositionSummary

# Interface: SimpleLoanPositionSummary

Defined in: [packages/client/src/modules/simple-loans/types.ts:389](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L389)

Current lending position backing the simple loan.

## Properties

### borrowedAmount

> **borrowedAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:397](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L397)

Borrowed principal in the borrow asset's base units.

***

### borrowedDecimals

> **borrowedDecimals**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:399](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L399)

Decimal scale for borrowed/debt amounts.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:391](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L391)

Current collateral amount in the collateral asset's base units.

***

### collateralDecimals

> **collateralDecimals**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:393](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L393)

Decimal scale for `collateralAmount`.

***

### collateralInterestAmount

> **collateralInterestAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:395](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L395)

Earned interest on the collateral side in base units.

***

### debtInterestAmount

> **debtInterestAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:401](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L401)

Accrued borrow interest in base units.

***

### totalDebtAmount

> **totalDebtAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:403](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L403)

Borrowed principal plus accrued interest in base units, before repayment buffer.
