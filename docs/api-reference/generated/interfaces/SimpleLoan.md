[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoan

# Interface: SimpleLoan

Defined in: [packages/client/src/modules/simple-loans/types.ts:441](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L441)

Hydrated simple loan state plus generated quote targets.

## Properties

### borrow

> **borrow**: [`SimpleLoanBorrow`](../type-aliases/SimpleLoanBorrow.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:455](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L455)

Borrow-side pool, asset, chain, decimals, requested amount, and destination.

***

### collateral

> **collateral**: [`SimpleLoanCollateral`](SimpleLoanCollateral.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:453](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L453)

Collateral-side pool, asset, decimals, and requested credited amount.

***

### initialDeposit

> **initialDeposit**: [`SimpleLoanInitialDeposit`](SimpleLoanInitialDeposit.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:459](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L459)

Current actionable initial collateral deposit quote.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:443](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L443)

Canister-assigned loan id.

***

### position

> **position**: [`SimpleLoanPositionSummary`](SimpleLoanPositionSummary.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:463](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L463)

Current lending position state for the generated profile.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:449](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L449)

Generated profile principal used by the simple loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:445](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L445)

Short user-facing reference derived from `loanId`.

***

### refundDestination

> **refundDestination**: [`LiquidiumAccount`](../type-aliases/LiquidiumAccount.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:457](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L457)

Destination used for collateral refunds or withdrawals.

***

### repayment

> **repayment**: [`SimpleLoanRepayment`](SimpleLoanRepayment.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:461](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L461)

Current repayment quote. Amount fields are zero when the loan has no debt.

***

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:447](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L447)

Shared lifecycle status for display and flow control.

***

### terms

> **terms**: [`SimpleLoanTerms`](SimpleLoanTerms.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:451](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L451)

Immutable loan terms.
