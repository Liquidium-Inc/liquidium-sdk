[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanCandidate

# Interface: InstantLoanCandidate

Defined in: [packages/client/src/modules/instant-loans/types.ts:425](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L425)

Discovery result returned by address lookup.

Candidates are intentionally lightweight; call `instantLoans.get(...)` with
`loanId` or `ref` to load canonical canister state and transfer targets.

## Properties

### borrowAsset

> **borrowAsset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:441](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L441)

Borrow asset symbol.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:437](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L437)

Principal text of the borrow pool.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:443](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L443)

Collateral amount in base units.

***

### collateralAsset

> **collateralAsset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:439](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L439)

Collateral asset symbol.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:435](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L435)

Principal text of the collateral pool.

***

### createdAt?

> `optional` **createdAt?**: `Date`

Defined in: [packages/client/src/modules/instant-loans/types.ts:433](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L433)

API-observed creation time, if provided by the indexer.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:427](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L427)

Canister-assigned loan id.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:431](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L431)

Generated lending profile principal used by the instant loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:429](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L429)

Short user-facing reference derived from `loanId`.
