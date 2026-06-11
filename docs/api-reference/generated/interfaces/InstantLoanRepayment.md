[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanRepayment

# Interface: InstantLoanRepayment

Defined in: [packages/client/src/modules/instant-loans/types.ts:315](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L315)

Current amount to send to the repayment target to close the debt.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:317](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L317)

Full amount to send to the repayment target, including fee and interest buffer.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:331](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L331)

Asset to repay.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:333](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L333)

Chain used for repayment.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:321](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L321)

Current debt in base units, before fee and interest buffer.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:319](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L319)

Decimal scale for `amount`.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:327](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L327)

Inflow fee amount in base units added to the repayment transfer. Falls back to the protocol minimum when live estimation is unavailable.

***

### inflowFeeEstimateAvailable

> **inflowFeeEstimateAvailable**: `boolean`

Defined in: [packages/client/src/modules/instant-loans/types.ts:329](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L329)

Whether `inflowFeeAmount` came from a live fee estimate.

***

### interestBufferAmount

> **interestBufferAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:323](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L323)

Additional interest buffer in base units.

***

### interestBufferSeconds

> **interestBufferSeconds**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:325](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L325)

Seconds of interest accrual included in `interestBufferAmount`.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:335](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L335)

Address or ICRC account where the repayment should be sent.
