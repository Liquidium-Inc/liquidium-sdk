[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanRepayment

# Interface: InstantLoanRepayment

Defined in: [packages/client/src/modules/instant-loans/types.ts:228](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L228)

Current amount to send to the repayment target to close the debt.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:230](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L230)

Full amount to send to the repayment target, including fee and interest buffer.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:244](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L244)

Asset to repay.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:246](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L246)

Chain used for repayment.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:234](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L234)

Current debt in base units, before fee and interest buffer.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:232](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L232)

Decimal scale for `amount`.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:240](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L240)

Inflow fee amount in base units added to the repayment transfer. Falls back to the protocol minimum when live estimation is unavailable.

***

### inflowFeeEstimateAvailable

> **inflowFeeEstimateAvailable**: `boolean`

Defined in: [packages/client/src/modules/instant-loans/types.ts:242](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L242)

Whether `inflowFeeAmount` came from a live fee estimate.

***

### interestBufferAmount

> **interestBufferAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:236](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L236)

Additional interest buffer in base units.

***

### interestBufferSeconds

> **interestBufferSeconds**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:238](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L238)

Seconds of interest accrual included in `interestBufferAmount`.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:248](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L248)

Address or ICRC account where the repayment should be sent.
