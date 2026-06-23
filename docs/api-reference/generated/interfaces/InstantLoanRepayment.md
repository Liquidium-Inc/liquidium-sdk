[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanRepayment

# Interface: InstantLoanRepayment

Defined in: [packages/client/src/modules/instant-loans/types.ts:339](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L339)

Current amount to send to the repayment target to close the debt.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:341](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L341)

Full amount to send to the repayment target, including fee and interest buffer.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:355](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L355)

Asset to repay.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:357](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L357)

Chain used for repayment.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:345](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L345)

Current debt in base units, before fee and interest buffer.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:343](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L343)

Decimal scale for `amount`.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:351](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L351)

Inflow fee amount in base units added to the repayment transfer. Falls back to the protocol minimum when live estimation is unavailable.

***

### inflowFeeEstimateAvailable

> **inflowFeeEstimateAvailable**: `boolean`

Defined in: [packages/client/src/modules/instant-loans/types.ts:353](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L353)

Whether `inflowFeeAmount` came from a live fee estimate.

***

### interestBufferAmount

> **interestBufferAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:347](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L347)

Additional interest buffer in base units.

***

### interestBufferSeconds

> **interestBufferSeconds**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:349](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L349)

Seconds of interest accrual included in `interestBufferAmount`.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:359](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L359)

Address or ICRC account where the repayment should be sent.
