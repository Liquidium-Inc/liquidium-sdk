[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / QuoteModule

# Class: QuoteModule

Defined in: [packages/client/src/modules/quote/quote.ts:60](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/quote.ts#L60)

Pure quote helpers for LTV and required-collateral calculations.

## Constructors

### Constructor

> **new QuoteModule**(): `QuoteModule`

#### Returns

`QuoteModule`

## Methods

### calculateLtv()

> **calculateLtv**(`request`, `pools`, `prices`): [`LtvCalculation`](../interfaces/LtvCalculation.md)

Defined in: [packages/client/src/modules/quote/quote.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/quote.ts#L71)

Calculates current LTV from caller-supplied borrow and collateral amounts.

Amount fields are base units. USD fields are scaled to 8 decimal places.

#### Parameters

##### request

[`CalculateLtvRequest`](../interfaces/CalculateLtvRequest.md)

Borrow and collateral pool ids plus base-unit amounts.

##### pools

[`Pool`](../interfaces/Pool.md)[]

Available pools, usually from `client.market.listPools()`.

##### prices

[`AssetPrices`](../type-aliases/AssetPrices.md)

USD price map, usually from `client.market.getAssetPrices()`.

#### Returns

[`LtvCalculation`](../interfaces/LtvCalculation.md)

LTV calculation plus validation errors when inputs are unusable.

***

### getQuote()

> **getQuote**(`request`, `pools`, `prices`): [`QuoteResult`](../interfaces/QuoteResult.md)

Defined in: [packages/client/src/modules/quote/quote.ts:209](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/quote.ts#L209)

Calculates a loan quote based on borrow amount, LTV, and pool selections.

All arithmetic is performed in bigint. `requiredCollateralAmount` and
`requiredCollateralUsd` are rounded UP so the caller never under-collateralizes
due to integer truncation. `borrowUsd` is floored for display.

#### Parameters

##### request

[`QuoteRequest`](../interfaces/QuoteRequest.md)

Quote request parameters.

##### pools

[`Pool`](../interfaces/Pool.md)[]

All available pools (use MarketModule.listPools() to fetch).

##### prices

[`AssetPrices`](../type-aliases/AssetPrices.md)

Asset prices in USD (use MarketModule.getAssetPrices() to fetch).

#### Returns

[`QuoteResult`](../interfaces/QuoteResult.md)

Quote result with required collateral and validation state.
