[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserPositionSummary

# Interface: UserPositionSummary

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:61](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L61)

Derived profile-level position summary for dashboards.

## Properties

### availableBorrowsUsd

> **availableBorrowsUsd**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:67](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L67)

Available borrow capacity in USD-scaled units.

***

### currentLtvBps

> **currentLtvBps**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L73)

Current LTV in basis points.

***

### healthFactor

> **healthFactor**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L79)

Current health factor.

***

### netWorthUsd

> **netWorthUsd**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:69](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L69)

Collateral minus debt in USD-scaled units.

***

### totalCollateralUsd

> **totalCollateralUsd**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:63](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L63)

Total collateral USD value.

***

### totalDebtUsd

> **totalDebtUsd**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:65](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L65)

Total debt USD value.

***

### usdDecimals

> **usdDecimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L71)

Decimal scale for USD fields.

***

### weightedLiquidationThresholdBps

> **weightedLiquidationThresholdBps**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L77)

Weighted liquidation threshold in basis points.

***

### weightedMaxLtvBps

> **weightedMaxLtvBps**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L75)

Weighted maximum LTV in basis points.
