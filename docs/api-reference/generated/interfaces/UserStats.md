[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserStats

# Interface: UserStats

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:37](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L37)

Aggregate debt, collateral, and liquidation stats for a profile.

## Properties

### borrowingPower

> **borrowingPower**: [`BorrowingPower`](BorrowingPower.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L49)

Current borrowing capacity.

***

### collateral

> **collateral**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:43](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L43)

Total collateral value in USD-scaled units.

***

### collateralDecimals

> **collateralDecimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:45](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L45)

Decimal scale for `collateral`.

***

### debt

> **debt**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:39](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L39)

Total debt value in USD-scaled units.

***

### debtDecimals

> **debtDecimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:41](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L41)

Decimal scale for `debt`.

***

### weightedLiquidationThreshold

> **weightedLiquidationThreshold**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:47](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L47)

Weighted liquidation threshold, scaled by protocol rate decimals.
