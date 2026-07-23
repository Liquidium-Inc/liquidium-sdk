[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserPositionSummary

# Interface: UserPositionSummary

Defined in: [packages/client/src/modules/positions/types.ts:63](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L63)

Derived profile-level position summary for dashboards.

## Properties

### availableBorrowsUsd

> **availableBorrowsUsd**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:69](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L69)

Available borrow capacity in USD-scaled units.

***

### currentLtvBps

> **currentLtvBps**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L75)

Current LTV in basis points.

***

### healthFactor

> **healthFactor**: `bigint` \| `null`

Defined in: [packages/client/src/modules/positions/types.ts:81](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L81)

Health factor scaled by `healthFactorDecimals`, or `null` with no debt.

***

### healthFactorDecimals

> **healthFactorDecimals**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:83](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L83)

Decimal scale for a finite `healthFactor`.

***

### netWorthUsd

> **netWorthUsd**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L71)

Collateral minus debt in USD-scaled units.

***

### totalCollateralUsd

> **totalCollateralUsd**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:65](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L65)

Total collateral USD value.

***

### totalDebtUsd

> **totalDebtUsd**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:67](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L67)

Total debt USD value.

***

### usdDecimals

> **usdDecimals**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L73)

Decimal scale for USD fields.

***

### weightedLiquidationThresholdBps

> **weightedLiquidationThresholdBps**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L79)

Weighted liquidation threshold in basis points.

***

### weightedMaxLtvBps

> **weightedMaxLtvBps**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L77)

Weighted maximum LTV in basis points.
