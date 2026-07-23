[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanRepaymentTargetQuote

# Interface: SimpleLoanRepaymentTargetQuote

Defined in: [packages/client/src/modules/simple-loans/types.ts:347](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L347)

Fee-inclusive repayment quote for one transfer target.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:349](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L349)

Full amount to send to the repayment target, including fee and interest buffer.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:351](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L351)

Inflow fee amount in base units added to the repayment transfer. Native ETH falls back to 0.00025 ETH when the live estimate fails or is non-positive.

***

### inflowFeeEstimateAvailable

> **inflowFeeEstimateAvailable**: `boolean`

Defined in: [packages/client/src/modules/simple-loans/types.ts:353](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L353)

Whether `inflowFeeAmount` came from a live fee estimate.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:355](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L355)

Address or ICRC account where the repayment should be sent.
