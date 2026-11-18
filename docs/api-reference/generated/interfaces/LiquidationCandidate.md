[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidationCandidate

# Interface: LiquidationCandidate

Defined in: packages/client/src/modules/liquidations/types.ts:37

Borrower whose health factor is below the liquidation threshold.

## Properties

### borrowerProfileId

> **borrowerProfileId**: `string`

Defined in: packages/client/src/modules/liquidations/types.ts:39

Borrower profile principal used by `liquidate(...)`.

***

### healthFactor

> **healthFactor**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:41

Health factor scaled to three decimals. `1000n` means `1.0`.

***

### positions

> **positions**: [`LiquidationCandidatePosition`](LiquidationCandidatePosition.md)[]

Defined in: packages/client/src/modules/liquidations/types.ts:47

Pool positions that can supply debt or collateral for liquidation.

***

### totalDebtUsd

> **totalDebtUsd**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:43

Total debt USD value scaled to 27 decimals.

***

### weightedLiquidationThresholdBps

> **weightedLiquidationThresholdBps**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:45

Weighted liquidation threshold in basis points.
