[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanPositionSummary

# Interface: InstantLoanPositionSummary

Defined in: [packages/client/src/modules/instant-loans/types.ts:268](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L268)

Current lending position backing the instant loan.

## Properties

### borrowedAmount

> **borrowedAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:276](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L276)

Borrowed principal in the borrow asset's base units.

***

### borrowedDecimals

> **borrowedDecimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:278](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L278)

Decimal scale for borrowed/debt amounts.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:270](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L270)

Current collateral amount in the collateral asset's base units.

***

### collateralDecimals

> **collateralDecimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:272](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L272)

Decimal scale for `collateralAmount`.

***

### collateralInterestAmount

> **collateralInterestAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:274](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L274)

Earned interest on the collateral side in base units.

***

### debtInterestAmount

> **debtInterestAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:280](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L280)

Accrued borrow interest in base units.

***

### totalDebtAmount

> **totalDebtAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:282](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L282)

Borrowed principal plus accrued interest in base units, before repayment buffer.
