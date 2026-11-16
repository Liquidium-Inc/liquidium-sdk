[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InflowFeeEstimate

# Interface: InflowFeeEstimate

Defined in: packages/client/src/modules/lending/types.ts:396

Fee estimate for an inflow target, rounded up to the asset's fee unit.

## Properties

### minimumSendAmount?

> `optional` **minimumSendAmount?**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:400

SOL/ckSOL minimum gross transfer that can produce a positive credit.

***

### totalFee

> **totalFee**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:398

Estimated total fee rounded up in the asset's base units.

***

### walletTransferFee?

> `optional` **walletTransferFee?**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:402

SOL/ckSOL sender fee, paid separately from the transfer amount.
