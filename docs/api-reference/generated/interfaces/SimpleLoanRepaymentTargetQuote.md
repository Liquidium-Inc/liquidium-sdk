[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanRepaymentTargetQuote

# Interface: SimpleLoanRepaymentTargetQuote

Defined in: [packages/client/src/modules/simple-loans/types.ts:345](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L345)

Fee-inclusive repayment quote for one transfer target.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:347](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L347)

Full amount to send to the repayment target, including fee and interest buffer.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:349](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L349)

Inflow fee amount in base units added to the repayment transfer. Falls back to the protocol minimum when live estimation is unavailable.

***

### inflowFeeEstimateAvailable

> **inflowFeeEstimateAvailable**: `boolean`

Defined in: [packages/client/src/modules/simple-loans/types.ts:351](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L351)

Whether `inflowFeeAmount` came from a live fee estimate.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:353](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L353)

Address or ICRC account where the repayment should be sent.
