[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanInitialDeposit

# Interface: SimpleLoanInitialDeposit

Defined in: [packages/client/src/modules/simple-loans/types.ts:375](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L375)

Initial collateral deposit quote returned when a simple loan is created.

## Properties

### asset

> **asset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:381](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L381)

Collateral asset to deposit.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:379](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L379)

Intended credited collateral amount in base units, before inflow fees.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:377](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L377)

Decimal scale for `amount`, `collateralAmount`, and `inflowFeeAmount`.

***

### detectedTimestamp

> **detectedTimestamp**: `bigint` \| `null`

Defined in: [packages/client/src/modules/simple-loans/types.ts:385](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L385)

Unix timestamp in seconds when the collateral deposit was detected, or null before detection.

***

### expiryTimestamp

> **expiryTimestamp**: `bigint` \| `null`

Defined in: [packages/client/src/modules/simple-loans/types.ts:387](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L387)

Unix timestamp in seconds when the collateral deposit window expires, or null before detection when unavailable.

***

### targets

> **targets**: `Partial`\<`Record`\<[`Chain`](../type-aliases/Chain.md), [`SimpleLoanInitialDepositTargetQuote`](SimpleLoanInitialDepositTargetQuote.md)\>\>

Defined in: [packages/client/src/modules/simple-loans/types.ts:383](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L383)

Available collateral deposit targets keyed by the actual transfer chain.
