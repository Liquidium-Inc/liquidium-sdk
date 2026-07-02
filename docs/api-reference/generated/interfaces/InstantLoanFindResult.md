[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindResult

# Interface: InstantLoanFindResult

Defined in: [packages/client/src/modules/instant-loans/types.ts:217](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L217)

Lightweight search result for an instant loan match.

## Properties

### borrow

> **borrow**: [`InstantLoanFindBorrow`](InstantLoanFindBorrow.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:227](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L227)

Borrow-side pool and asset.

***

### collateral

> **collateral**: [`InstantLoanFindCollateral`](InstantLoanFindCollateral.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:225](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L225)

Collateral-side pool, asset, and requested credited amount.

***

### createdAt

> **createdAt**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:223](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L223)

Unix creation timestamp in seconds.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:219](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L219)

Canister-assigned loan id. Use this with `client.instantLoans.get({ loanId })` to load full loan state.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:229](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L229)

Generated profile principal from the search index.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:221](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L221)

Short user-facing reference derived from `loanId`.
