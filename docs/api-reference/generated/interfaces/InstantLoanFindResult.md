[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindResult

# Interface: InstantLoanFindResult

Defined in: [packages/client/src/modules/instant-loans/types.ts:172](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L172)

Lightweight search result for an instant loan match.

## Properties

### borrow

> **borrow**: [`InstantLoanFindBorrow`](InstantLoanFindBorrow.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:182](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L182)

Borrow-side pool and asset.

***

### collateral

> **collateral**: [`InstantLoanFindCollateral`](InstantLoanFindCollateral.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:180](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L180)

Collateral-side pool, asset, and requested credited amount.

***

### createdAt

> **createdAt**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:178](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L178)

Unix creation timestamp in seconds.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:174](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L174)

Canister-assigned loan id. Use this with `client.instantLoans.get({ loanId })` to load full loan state.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:184](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L184)

Generated profile principal from the search index.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:176](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L176)

Short user-facing reference derived from `loanId`.
