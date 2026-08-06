[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanRepayment

# Interface: SimpleLoanRepayment

Defined in: packages/client/src/modules/simple-loans/types.ts:389

Current amount to send to a repayment target to close the debt.

## Properties

### asset

> **asset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: packages/client/src/modules/simple-loans/types.ts:399

Asset to repay.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:393

Current debt in base units, before fee and interest buffer.

***

### decimals

> **decimals**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:391

Decimal scale for `amount`.

***

### interestBufferAmount

> **interestBufferAmount**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:395

Additional interest buffer in base units.

***

### interestBufferSeconds

> **interestBufferSeconds**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:397

Seconds of interest accrual included in `interestBufferAmount`.

***

### targets

> **targets**: `Partial`\<`Record`\<[`Chain`](../type-aliases/Chain.md), [`SimpleLoanRepaymentTargetQuote`](SimpleLoanRepaymentTargetQuote.md)\>\>

Defined in: packages/client/src/modules/simple-loans/types.ts:401

Available repayment targets keyed by the actual transfer chain.
