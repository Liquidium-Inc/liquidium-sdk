[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanCandidate

# Interface: InstantLoanCandidate

Defined in: [packages/client/src/modules/instant-loans/types.ts:345](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L345)

Discovery result returned by address lookup.

Candidates are intentionally lightweight; call `instantLoans.get(...)` with
`loanId` or `ref` to load canonical canister state and transfer targets.

## Properties

### borrowAsset

> **borrowAsset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:361](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L361)

Borrow asset symbol.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:357](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L357)

Principal text of the borrow pool.

***

### collateralAmountHint

> **collateralAmountHint**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:363](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L363)

Collateral amount hint in base units.

***

### collateralAsset

> **collateralAsset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:359](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L359)

Collateral asset symbol.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:355](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L355)

Principal text of the collateral pool.

***

### createdAt?

> `optional` **createdAt?**: `Date`

Defined in: [packages/client/src/modules/instant-loans/types.ts:353](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L353)

API-observed creation time, if provided by the indexer.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:347](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L347)

Canister-assigned loan id.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:351](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L351)

Generated lending profile principal used by the instant loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:349](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L349)

Short user-facing reference derived from `loanId`.
