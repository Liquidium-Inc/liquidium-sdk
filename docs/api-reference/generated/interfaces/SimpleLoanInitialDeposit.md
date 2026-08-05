[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanInitialDeposit

# Interface: SimpleLoanInitialDeposit

Defined in: [packages/client/src/modules/simple-loans/types.ts:405](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L405)

Initial collateral deposit quote returned when a simple loan is created.

## Properties

### asset

> **asset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:411](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L411)

Collateral asset to deposit.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:409](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L409)

Intended credited collateral amount in base units, before inflow fees.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:407](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L407)

Decimal scale for `amount`, `collateralAmount`, and `inflowFeeAmount`.

***

### detectedTimestamp

> **detectedTimestamp**: `bigint` \| `null`

Defined in: [packages/client/src/modules/simple-loans/types.ts:415](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L415)

Unix timestamp in seconds when the collateral deposit was detected, or null before detection.

***

### expiryTimestamp

> **expiryTimestamp**: `bigint` \| `null`

Defined in: [packages/client/src/modules/simple-loans/types.ts:417](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L417)

Unix timestamp in seconds when the collateral deposit window expires, or null before detection when unavailable.

***

### targets

> **targets**: `Partial`\<`Record`\<[`Chain`](../type-aliases/Chain.md), [`SimpleLoanInitialDepositTargetQuote`](SimpleLoanInitialDepositTargetQuote.md)\>\>

Defined in: [packages/client/src/modules/simple-loans/types.ts:413](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L413)

Available collateral deposit targets keyed by the actual transfer chain.
