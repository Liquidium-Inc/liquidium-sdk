[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoan

# Interface: InstantLoan

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:279](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L279)

Hydrated instant-loan state plus generated deposit and repayment targets.

## Properties

### borrow

> **borrow**: `object`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:300](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L300)

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

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:293](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L293)

Collateral-side pool, asset, chain, and current or requested collateral amount.

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

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:310](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L310)

Address or ICRC account where the user deposits collateral.

***

### depositWindowSeconds

> **depositWindowSeconds**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:291](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L291)

Seconds allowed for the collateral deposit before timeout.

***

### loanId

> **loanId**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:281](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L281)

Canister-assigned loan id.

***

### ltvMaxBps

> **ltvMaxBps**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:289](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L289)

Maximum loan-to-value ratio in basis points.

***

### position

> **position**: [`InstantLoanPositionSummary`](InstantLoanPositionSummary.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:316](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L316)

Current lending position state for the generated profile.

***

### profileId

> **profileId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:287](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L287)

Generated lending profile principal used by the instant loan.

***

### ref

> **ref**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:283](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L283)

Short user-facing reference derived from `loanId`.

***

### refundDestination

> **refundDestination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:308](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L308)

Destination used for collateral refunds or withdrawals.

***

### repayment

> **repayment**: [`InstantLoanRepayment`](InstantLoanRepayment.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:314](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L314)

Current actionable repayment quote.

***

### repayTarget

> **repayTarget**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:312](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L312)

Address or ICRC account where the user repays debt.

***

### status

> **status**: [`InstantLoanStatus`](../type-aliases/InstantLoanStatus.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:285](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L285)

Simplified lifecycle status for display and flow control.
