[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoan

# Interface: InstantLoan

Defined in: [packages/client/src/modules/instant-loans/types.ts:417](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L417)

Hydrated instant-loan state plus generated quote targets.

## Properties

### borrow

> **borrow**: [`InstantLoanBorrow`](InstantLoanBorrow.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:431](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L431)

Borrow-side pool, asset, chain, decimals, requested amount, and destination.

***

### collateral

> **collateral**: [`InstantLoanCollateral`](InstantLoanCollateral.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:429](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L429)

Collateral-side pool, asset, chain, decimals, and requested credited amount.

***

### initialDeposit

> **initialDeposit**: [`InstantLoanInitialDeposit`](InstantLoanInitialDeposit.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:435](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L435)

Current actionable initial collateral deposit quote.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:419](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L419)

Canister-assigned loan id.

***

### position

> **position**: [`InstantLoanPositionSummary`](InstantLoanPositionSummary.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:439](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L439)

Current lending position state for the generated profile.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:425](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L425)

Generated profile principal used by the instant loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:421](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L421)

Short user-facing reference derived from `loanId`.

***

### refundDestination

> **refundDestination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:433](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L433)

Destination used for collateral refunds or withdrawals.

***

### repayment

> **repayment**: [`InstantLoanRepayment`](InstantLoanRepayment.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:437](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L437)

Current repayment quote. Amount fields are zero when the loan has no debt.

***

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:423](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L423)

Shared lifecycle status for display and flow control.

***

### terms

> **terms**: [`InstantLoanTerms`](InstantLoanTerms.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:427](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L427)

Immutable loan terms.
