[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanFindResult

# Interface: SimpleLoanFindResult

Defined in: [packages/client/src/modules/simple-loans/types.ts:192](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L192)

Lightweight search result for a simple loan match.

## Properties

### borrow

> **borrow**: [`SimpleLoanFindBorrow`](SimpleLoanFindBorrow.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:202](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L202)

Borrow-side pool and asset.

***

### collateral

> **collateral**: [`SimpleLoanFindCollateral`](SimpleLoanFindCollateral.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:200](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L200)

Collateral-side pool, asset, and requested credited amount.

***

### createdAt

> **createdAt**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:198](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L198)

Unix creation timestamp in seconds.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:194](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L194)

Canister-assigned loan id. Use this with `client.simpleLoans.get({ loanId })` to load full loan state.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:204](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L204)

Generated profile principal from the search index.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:196](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L196)

Short user-facing reference derived from `loanId`.
