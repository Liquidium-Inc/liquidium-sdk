[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindResult

# Interface: InstantLoanFindResult

Defined in: [packages/client/src/modules/instant-loans/types.ts:195](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L195)

Lightweight search result for an instant loan match.

## Properties

### borrow

> **borrow**: [`InstantLoanFindBorrow`](InstantLoanFindBorrow.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:205](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L205)

Borrow-side pool and asset.

***

### collateral

> **collateral**: [`InstantLoanFindCollateral`](InstantLoanFindCollateral.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:203](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L203)

Collateral-side pool, asset, and requested credited amount.

***

### createdAt

> **createdAt**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:201](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L201)

Unix creation timestamp in seconds.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:197](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L197)

Canister-assigned loan id. Use this with `client.instantLoans.get({ loanId })` to load full loan state.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:207](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L207)

Generated profile principal from the search index.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:199](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L199)

Short user-facing reference derived from `loanId`.
