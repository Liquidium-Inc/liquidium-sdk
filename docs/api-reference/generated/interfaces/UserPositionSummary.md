[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserPositionSummary

# Interface: UserPositionSummary

Defined in: packages/client/src/modules/positions/types.ts:63

Derived profile-level position summary for dashboards.

## Properties

### availableBorrowsUsd

> **availableBorrowsUsd**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:69

Available borrow capacity in USD-scaled units.

***

### currentLtvBps

> **currentLtvBps**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:75

Current LTV in basis points.

***

### healthFactor

> **healthFactor**: `bigint` \| `null`

Defined in: packages/client/src/modules/positions/types.ts:81

Health factor scaled by `healthFactorDecimals`, or `null` with no debt.

***

### healthFactorDecimals

> **healthFactorDecimals**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:83

Decimal scale for a finite `healthFactor`.

***

### netWorthUsd

> **netWorthUsd**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:71

Collateral minus debt in USD-scaled units.

***

### totalCollateralUsd

> **totalCollateralUsd**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:65

Total collateral USD value.

***

### totalDebtUsd

> **totalDebtUsd**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:67

Total debt USD value.

***

### usdDecimals

> **usdDecimals**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:73

Decimal scale for USD fields.

***

### weightedLiquidationThresholdBps

> **weightedLiquidationThresholdBps**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:79

Weighted liquidation threshold in basis points.

***

### weightedMaxLtvBps

> **weightedMaxLtvBps**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:77

Weighted maximum LTV in basis points.
