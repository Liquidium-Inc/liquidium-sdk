[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoan

# Interface: InstantLoan

Defined in: [packages/client/src/modules/instant-loans/types.ts:297](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L297)

Hydrated instant-loan state plus generated deposit and repayment targets.

## Properties

### borrow

> **borrow**: `object`

Defined in: [packages/client/src/modules/instant-loans/types.ts:318](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L318)

Borrow-side pool, asset, chain, requested amount, and destination.

#### amount

> **amount**: `bigint`

#### asset

> **asset**: `string`

#### chain

> **chain**: `string`

#### destination

> **destination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

#### poolId

> **poolId**: `string`

***

### collateral

> **collateral**: `object`

Defined in: [packages/client/src/modules/instant-loans/types.ts:311](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L311)

Collateral-side pool, asset, chain, and current or requested credited collateral amount.

#### amount

> **amount**: `bigint`

#### asset

> **asset**: `string`

#### chain

> **chain**: `string`

#### poolId

> **poolId**: `string`

***

### depositTarget

> **depositTarget**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:328](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L328)

Address or ICRC account where the user deposits collateral.

***

### depositWindowSeconds

> **depositWindowSeconds**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:309](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L309)

Seconds allowed for the collateral deposit before timeout.

***

### initialDeposit

> **initialDeposit**: [`InstantLoanInitialDeposit`](InstantLoanInitialDeposit.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:332](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L332)

Current actionable initial collateral deposit quote.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:299](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L299)

Canister-assigned loan id.

***

### ltvMaxBps

> **ltvMaxBps**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:307](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L307)

Maximum loan-to-value ratio in basis points.

***

### position

> **position**: [`InstantLoanPositionSummary`](InstantLoanPositionSummary.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:336](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L336)

Current lending position state for the generated profile.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:305](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L305)

Generated lending profile principal used by the instant loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:301](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L301)

Short user-facing reference derived from `loanId`.

***

### refundDestination

> **refundDestination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:326](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L326)

Destination used for collateral refunds or withdrawals.

***

### repayment

> **repayment**: [`InstantLoanRepayment`](InstantLoanRepayment.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:334](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L334)

Current actionable repayment quote.

***

### repayTarget

> **repayTarget**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:330](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L330)

Address or ICRC account where the user repays debt.

***

### status

> **status**: [`InstantLoanStatus`](../type-aliases/InstantLoanStatus.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:303](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L303)

Simplified lifecycle status for display and flow control.
