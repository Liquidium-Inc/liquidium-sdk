[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoan

# Interface: InstantLoan

Defined in: [packages/client/src/modules/instant-loans/types.ts:391](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L391)

Hydrated instant-loan state plus generated quote targets.

## Properties

### borrow

> **borrow**: [`InstantLoanBorrow`](InstantLoanBorrow.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:405](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L405)

Borrow-side pool, asset, chain, decimals, requested amount, and destination.

***

### collateral

> **collateral**: [`InstantLoanCollateral`](InstantLoanCollateral.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:403](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L403)

Collateral-side pool, asset, chain, decimals, and requested credited amount.

***

### initialDeposit

> **initialDeposit**: [`InstantLoanInitialDeposit`](InstantLoanInitialDeposit.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:409](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L409)

Current actionable initial collateral deposit quote.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:393](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L393)

Canister-assigned loan id.

***

### position

> **position**: [`InstantLoanPositionSummary`](InstantLoanPositionSummary.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:413](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L413)

Current lending position state for the generated profile.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:399](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L399)

Generated lending profile principal used by the instant loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:395](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L395)

Short user-facing reference derived from `loanId`.

***

### refundDestination

> **refundDestination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:407](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L407)

Destination used for collateral refunds or withdrawals.

***

### repayment

> **repayment**: [`InstantLoanRepayment`](InstantLoanRepayment.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:411](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L411)

Current repayment quote. Amount fields are zero when the loan has no debt.

***

### status

> **status**: [`InstantLoanStatus`](../type-aliases/InstantLoanStatus.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:397](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L397)

Simplified lifecycle status for display and flow control.

***

### terms

> **terms**: [`InstantLoanTerms`](InstantLoanTerms.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:401](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L401)

Immutable loan terms.
