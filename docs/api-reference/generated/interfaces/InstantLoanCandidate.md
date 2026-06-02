[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanCandidate

# Interface: InstantLoanCandidate

Defined in: [packages/client/src/modules/instant-loans/types.ts:369](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L369)

Discovery result returned by address lookup.

Candidates are intentionally lightweight; call `instantLoans.get(...)` with
`loanId` or `ref` to load canonical canister state and transfer targets.

## Properties

### borrowAsset

> **borrowAsset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:385](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L385)

Borrow asset symbol.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:381](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L381)

Principal text of the borrow pool.

***

### collateralAmountHint

> **collateralAmountHint**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:387](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L387)

Collateral amount hint in base units.

***

### collateralAsset

> **collateralAsset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:383](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L383)

Collateral asset symbol.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:379](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L379)

Principal text of the collateral pool.

***

### createdAt?

> `optional` **createdAt?**: `Date`

Defined in: [packages/client/src/modules/instant-loans/types.ts:377](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L377)

API-observed creation time, if provided by the indexer.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:371](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L371)

Canister-assigned loan id.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:375](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L375)

Generated lending profile principal used by the instant loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:373](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L373)

Short user-facing reference derived from `loanId`.
