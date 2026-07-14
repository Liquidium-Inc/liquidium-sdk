[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanRepayment

# Interface: SimpleLoanRepayment

Defined in: [packages/client/src/modules/simple-loans/types.ts:357](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L357)

Current amount to send to a repayment target to close the debt.

## Properties

### asset

> **asset**: `"BTC"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:367](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L367)

Asset to repay.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:361](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L361)

Current debt in base units, before fee and interest buffer.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:359](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L359)

Decimal scale for `amount`.

***

### interestBufferAmount

> **interestBufferAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:363](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L363)

Additional interest buffer in base units.

***

### interestBufferSeconds

> **interestBufferSeconds**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:365](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L365)

Seconds of interest accrual included in `interestBufferAmount`.

***

### targets

> **targets**: `Partial`\<`Record`\<[`Chain`](../type-aliases/Chain.md), [`SimpleLoanRepaymentTargetQuote`](SimpleLoanRepaymentTargetQuote.md)\>\>

Defined in: [packages/client/src/modules/simple-loans/types.ts:369](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L369)

Available repayment targets keyed by the actual transfer chain.
