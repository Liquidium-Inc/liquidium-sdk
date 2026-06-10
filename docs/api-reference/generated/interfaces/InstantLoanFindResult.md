[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindResult

# Interface: InstantLoanFindResult

Defined in: [packages/client/src/modules/instant-loans/types.ts:171](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L171)

Lightweight search result for an instant loan match.

## Properties

### borrow

> **borrow**: [`InstantLoanFindBorrow`](InstantLoanFindBorrow.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:181](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L181)

Borrow-side pool and asset.

***

### collateral

> **collateral**: [`InstantLoanFindCollateral`](InstantLoanFindCollateral.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:179](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L179)

Collateral-side pool, asset, and requested credited amount.

***

### createdAt

> **createdAt**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:177](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L177)

Unix creation timestamp in seconds.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:173](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L173)

Canister-assigned loan id. Use this with `client.instantLoans.get({ loanId })` to load full loan state.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:183](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L183)

Generated profile principal from the search index.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:175](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L175)

Short user-facing reference derived from `loanId`.
