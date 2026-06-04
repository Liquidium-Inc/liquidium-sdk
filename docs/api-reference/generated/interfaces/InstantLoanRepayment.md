[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanRepayment

# Interface: InstantLoanRepayment

Defined in: [packages/client/src/modules/instant-loans/types.ts:280](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L280)

Current amount to send to the repayment target to close the debt.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:282](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L282)

Full amount to send to the repayment target, including fee and interest buffer.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:296](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L296)

Asset to repay.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:298](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L298)

Chain used for repayment.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:286](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L286)

Current debt in base units, before fee and interest buffer.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:284](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L284)

Decimal scale for `amount`.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:292](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L292)

Inflow fee amount in base units added to the repayment transfer. Falls back to the protocol minimum when live estimation is unavailable.

***

### inflowFeeEstimateAvailable

> **inflowFeeEstimateAvailable**: `boolean`

Defined in: [packages/client/src/modules/instant-loans/types.ts:294](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L294)

Whether `inflowFeeAmount` came from a live fee estimate.

***

### interestBufferAmount

> **interestBufferAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:288](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L288)

Additional interest buffer in base units.

***

### interestBufferSeconds

> **interestBufferSeconds**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:290](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L290)

Seconds of interest accrual included in `interestBufferAmount`.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:300](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L300)

Address or ICRC account where the repayment should be sent.
