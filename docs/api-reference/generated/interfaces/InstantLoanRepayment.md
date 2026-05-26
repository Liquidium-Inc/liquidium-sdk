[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanRepayment

# Interface: InstantLoanRepayment

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:226](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L226)

Current amount to send to the repayment target to close the debt.

## Properties

### amount

> **amount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:228](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L228)

Full amount to send to the repayment target, including fee and interest buffer.

***

### asset

> **asset**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:242](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L242)

Asset to repay.

***

### chain

> **chain**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:244](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L244)

Chain used for repayment.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:232](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L232)

Current debt in base units, before fee and interest buffer.

***

### decimals

> **decimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:230](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L230)

Decimal scale for `amount`.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:238](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L238)

Inflow fee amount in base units added to the repayment transfer. Falls back to the protocol minimum when live estimation is unavailable.

***

### inflowFeeEstimateAvailable

> **inflowFeeEstimateAvailable**: `boolean`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:240](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L240)

Whether `inflowFeeAmount` came from a live fee estimate.

***

### interestBufferAmount

> **interestBufferAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:234](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L234)

Additional interest buffer in base units.

***

### interestBufferSeconds

> **interestBufferSeconds**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:236](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L236)

Seconds of interest accrual included in `interestBufferAmount`.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:246](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L246)

Address or ICRC account where the repayment should be sent.
