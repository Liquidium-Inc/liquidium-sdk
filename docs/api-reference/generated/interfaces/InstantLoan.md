[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoan

# Interface: InstantLoan

Defined in: [packages/client/src/modules/instant-loans/types.ts:394](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L394)

Hydrated instant-loan state plus generated quote targets.

## Properties

### borrow

> **borrow**: [`InstantLoanBorrow`](InstantLoanBorrow.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:408](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L408)

Borrow-side pool, asset, chain, decimals, requested amount, and destination.

***

### collateral

> **collateral**: [`InstantLoanCollateral`](InstantLoanCollateral.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:406](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L406)

Collateral-side pool, asset, chain, decimals, and requested credited amount.

***

### initialDeposit

> **initialDeposit**: [`InstantLoanInitialDeposit`](InstantLoanInitialDeposit.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:412](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L412)

Current actionable initial collateral deposit quote.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:396](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L396)

Canister-assigned loan id.

***

### position

> **position**: [`InstantLoanPositionSummary`](InstantLoanPositionSummary.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:416](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L416)

Current lending position state for the generated profile.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:402](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L402)

Generated lending profile principal used by the instant loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:398](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L398)

Short user-facing reference derived from `loanId`.

***

### refundDestination

> **refundDestination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:410](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L410)

Destination used for collateral refunds or withdrawals.

***

### repayment

> **repayment**: [`InstantLoanRepayment`](InstantLoanRepayment.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:414](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L414)

Current repayment quote. Amount fields are zero when the loan has no debt.

***

### status

> **status**: [`InstantLoanStatus`](../type-aliases/InstantLoanStatus.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:400](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L400)

Simplified lifecycle status for display and flow control.

***

### terms

> **terms**: [`InstantLoanTerms`](InstantLoanTerms.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:404](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L404)

Immutable loan terms.
