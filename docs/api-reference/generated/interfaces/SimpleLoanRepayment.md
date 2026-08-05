[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanRepayment

# Interface: SimpleLoanRepayment

Defined in: [packages/client/src/modules/simple-loans/types.ts:389](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L389)

Current amount to send to a repayment target to close the debt.

## Properties

### asset

> **asset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:399](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L399)

Asset to repay.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:393](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L393)

Current debt in base units, before fee and interest buffer.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:391](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L391)

Decimal scale for `amount`.

***

### interestBufferAmount

> **interestBufferAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:395](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L395)

Additional interest buffer in base units.

***

### interestBufferSeconds

> **interestBufferSeconds**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:397](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L397)

Seconds of interest accrual included in `interestBufferAmount`.

***

### targets

> **targets**: `Partial`\<`Record`\<[`Chain`](../type-aliases/Chain.md), [`SimpleLoanRepaymentTargetQuote`](SimpleLoanRepaymentTargetQuote.md)\>\>

Defined in: [packages/client/src/modules/simple-loans/types.ts:401](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L401)

Available repayment targets keyed by the actual transfer chain.
