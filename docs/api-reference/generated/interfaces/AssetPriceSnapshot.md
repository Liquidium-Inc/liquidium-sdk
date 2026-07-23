[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / AssetPriceSnapshot

# Interface: AssetPriceSnapshot

Defined in: [packages/client/src/modules/market/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L73)

Protocol prices with the time at which the SDK completed the fetch.

## Properties

### fetchedAt

> **fetchedAt**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L77)

Unix timestamp in seconds when the SDK received the price response.

***

### prices

> **prices**: [`AssetPrices`](../type-aliases/AssetPrices.md)

Defined in: [packages/client/src/modules/market/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L75)

USD price map keyed by market asset symbol.
