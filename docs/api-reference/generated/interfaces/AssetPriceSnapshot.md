[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / AssetPriceSnapshot

# Interface: AssetPriceSnapshot

Defined in: packages/client/src/modules/market/types.ts:75

Protocol prices with the time at which the SDK completed the fetch.

## Properties

### fetchedAt

> **fetchedAt**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:79

Unix timestamp in seconds when the SDK received the price response.

***

### prices

> **prices**: [`AssetPrices`](../type-aliases/AssetPrices.md)

Defined in: packages/client/src/modules/market/types.ts:77

USD price map keyed by market asset symbol.
