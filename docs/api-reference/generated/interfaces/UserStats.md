[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserStats

# Interface: UserStats

Defined in: packages/client/src/modules/positions/types.ts:37

Aggregate debt, collateral, and liquidation stats for a profile.

## Properties

### borrowingPower

> **borrowingPower**: [`BorrowingPower`](BorrowingPower.md)

Defined in: packages/client/src/modules/positions/types.ts:49

Current borrowing capacity.

***

### collateral

> **collateral**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:43

Total collateral value in USD-scaled units.

***

### collateralDecimals

> **collateralDecimals**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:45

Decimal scale for `collateral`.

***

### debt

> **debt**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:39

Total debt value in USD-scaled units.

***

### debtDecimals

> **debtDecimals**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:41

Decimal scale for `debt`.

***

### weightedLiquidationThreshold

> **weightedLiquidationThreshold**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:47

Weighted liquidation threshold in basis points.
