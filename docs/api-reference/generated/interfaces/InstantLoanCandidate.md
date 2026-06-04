[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanCandidate

# Interface: InstantLoanCandidate

Defined in: [packages/client/src/modules/instant-loans/types.ts:422](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L422)

Discovery result returned by address lookup.

Candidates are intentionally lightweight; call `instantLoans.get(...)` with
`loanId` or `ref` to load canonical canister state and transfer targets.

## Properties

### borrowAsset

> **borrowAsset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:438](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L438)

Borrow asset symbol.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:434](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L434)

Principal text of the borrow pool.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:440](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L440)

Collateral amount in base units.

***

### collateralAsset

> **collateralAsset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:436](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L436)

Collateral asset symbol.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:432](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L432)

Principal text of the collateral pool.

***

### createdAt?

> `optional` **createdAt?**: `Date`

Defined in: [packages/client/src/modules/instant-loans/types.ts:430](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L430)

API-observed creation time, if provided by the indexer.

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:424](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L424)

Canister-assigned loan id.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:428](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L428)

Generated lending profile principal used by the instant loan.

***

### ref

> **ref**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:426](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L426)

Short user-facing reference derived from `loanId`.
