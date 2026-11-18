[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanRepaymentTargetQuote

# Interface: SimpleLoanRepaymentTargetQuote

Defined in: packages/client/src/modules/simple-loans/types.ts:377

Fee-inclusive repayment quote for one transfer target.

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:379

Full transfer including fee, interest buffer, and any SOL minimum-send floor. Native SOL can exceed the debt plus fees for small repayments; the protocol keeps that excess as a pool fee unless the pool sets a repayment refund threshold.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:381

Inflow fee amount in base units added to the repayment transfer. Native ETH falls back to 0.00025 ETH when the live estimate fails or is non-positive.

***

### inflowFeeEstimateAvailable

> **inflowFeeEstimateAvailable**: `boolean`

Defined in: packages/client/src/modules/simple-loans/types.ts:383

Whether `inflowFeeAmount` came from a live fee estimate.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: packages/client/src/modules/simple-loans/types.ts:385

Address or ICRC account where the repayment should be sent.
