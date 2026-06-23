[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindResult

# Interface: InstantLoanFindResult

Defined in: [packages/client/src/modules/instant-loans/types.ts:196](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L196)

Lightweight search result for an instant loan match.

## Properties

### borrow

> **borrow**: [`InstantLoanFindBorrow`](InstantLoanFindBorrow.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:206](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L206)

Borrow-side pool and asset.

***

### collateral

> **collateral**: [`InstantLoanFindCollateral`](InstantLoanFindCollateral.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:204](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L204)

Collateral-side pool, asset, and requested credited amount.

***

### createdAt

> **createdAt**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:202](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L202)

Unix creation timestamp in seconds.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:198](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L198)

Canister-assigned loan id. Use this with `client.instantLoans.get({ loanId })` to load full loan state.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:208](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L208)

Generated profile principal from the search index.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:200](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L200)

Short user-facing reference derived from `loanId`.
