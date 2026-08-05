[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoan

# Interface: SimpleLoan

Defined in: [packages/client/src/modules/simple-loans/types.ts:471](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L471)

Hydrated simple loan state plus generated quote targets.

## Properties

### borrow

> **borrow**: [`SimpleLoanBorrow`](../type-aliases/SimpleLoanBorrow.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:485](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L485)

Borrow-side pool, asset, chain, decimals, requested amount, and destination.

***

### collateral

> **collateral**: [`SimpleLoanCollateral`](SimpleLoanCollateral.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:483](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L483)

Collateral-side pool, asset, decimals, and requested credited amount.

***

### initialDeposit

> **initialDeposit**: [`SimpleLoanInitialDeposit`](SimpleLoanInitialDeposit.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:489](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L489)

Current actionable initial collateral deposit quote.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:473](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L473)

Canister-assigned loan id.

***

### position

> **position**: [`SimpleLoanPositionSummary`](SimpleLoanPositionSummary.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:493](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L493)

Current lending position state for the generated profile.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:479](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L479)

Generated profile principal used by the simple loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:475](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L475)

Short user-facing reference derived from `loanId`.

***

### refundDestination

> **refundDestination**: [`LiquidiumAccount`](../type-aliases/LiquidiumAccount.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:487](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L487)

Destination used for collateral refunds or withdrawals.

***

### repayment

> **repayment**: [`SimpleLoanRepayment`](SimpleLoanRepayment.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:491](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L491)

Current repayment quote. Amount fields are zero when the loan has no debt.

***

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:477](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L477)

Shared lifecycle status for display and flow control.

***

### terms

> **terms**: [`SimpleLoanTerms`](SimpleLoanTerms.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:481](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L481)

Immutable loan terms.
