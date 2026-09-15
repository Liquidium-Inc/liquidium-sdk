[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / Pool

# Interface: Pool

Defined in: packages/client/src/modules/market/types.ts:4

Current protocol metadata and rate state for a lending pool.

## Properties

### asset

> **asset**: [`Asset`](../type-aliases/Asset.md)

Defined in: packages/client/src/modules/market/types.ts:8

Asset supplied to and borrowed from the pool.

***

### availableLiquidity

> **availableLiquidity**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:22

Currently available liquidity in base units.

***

### baseRate

> **baseRate**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:50

Base borrow rate, scaled by `rateDecimals`.

***

### borrowCap?

> `optional` **borrowCap?**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:26

Optional borrow cap in base units.

***

### borrowIndex

> **borrowIndex**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:60

Current borrow index.

***

### borrowingRate

> **borrowingRate**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:44

Current borrow APR, scaled by `rateDecimals`.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/market/types.ts:12

Chain associated with the pool asset.

***

### decimals

> **decimals**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:14

Number of base-unit decimals for pool amounts.

***

### displayName

> **displayName**: `string`

Defined in: packages/client/src/modules/market/types.ts:10

Human-readable name of the pool asset.

***

### estimatedBorrowingApy

> **estimatedBorrowingApy**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:46

Estimated borrow APY, scaled by `rateDecimals`.

***

### estimatedLendingApy

> **estimatedLendingApy**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:42

Estimated supply APY, scaled by `rateDecimals`.

***

### frozen

> **frozen**: `boolean`

Defined in: packages/client/src/modules/market/types.ts:16

Whether new pool activity is currently frozen.

***

### id

> **id**: `string`

Defined in: packages/client/src/modules/market/types.ts:6

Pool canister principal text.

***

### lastUpdated?

> `optional` **lastUpdated?**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:66

Unix timestamp in seconds of the last pool update when available.

***

### lendingIndex

> **lendingIndex**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:58

Current lending index.

***

### lendingRate

> **lendingRate**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:40

Current supply APR, scaled by `rateDecimals`.

***

### liquidationBonus

> **liquidationBonus**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:32

Liquidation bonus in basis points.

***

### liquidationThreshold

> **liquidationThreshold**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:30

Liquidation threshold in basis points.

***

### maxLtv

> **maxLtv**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:28

Maximum loan-to-value ratio in basis points.

***

### optimalUtilizationRate

> **optimalUtilizationRate**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:52

Optimal utilization point, scaled by `rateDecimals`.

***

### protocolLiquidationFee

> **protocolLiquidationFee**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:34

Protocol liquidation fee in basis points.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:38

Decimal scale used by APR and utilization fields.

***

### rateSlopeAfter

> **rateSlopeAfter**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:56

Rate slope after optimal utilization, scaled by `rateDecimals`.

***

### rateSlopeBefore

> **rateSlopeBefore**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:54

Rate slope before optimal utilization, scaled by `rateDecimals`.

***

### reserveFactor

> **reserveFactor**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:36

Reserve factor in basis points.

***

### sameAssetBorrowing

> **sameAssetBorrowing**: `boolean`

Defined in: packages/client/src/modules/market/types.ts:62

Whether borrowing the same asset as collateral is allowed.

***

### sameAssetBorrowingDustThreshold

> **sameAssetBorrowingDustThreshold**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:64

Same-asset collateral below this base-unit amount is treated as dust.

***

### supplyCap?

> `optional` **supplyCap?**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:24

Optional supply cap in base units.

***

### totalDebt

> **totalDebt**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:20

Current borrowed amount in base units after applying the borrow index.

***

### totalSupply

> **totalSupply**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:18

Current supplied amount in base units after applying the lending index.

***

### utilizationRate

> **utilizationRate**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:48

Current pool utilization, scaled by `rateDecimals`.
