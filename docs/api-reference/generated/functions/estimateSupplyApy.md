[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / estimateSupplyApy

# Function: estimateSupplyApy()

> **estimateSupplyApy**(`supplyApr`): `bigint`

Defined in: [packages/client/src/core/rates.ts:28](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/rates.ts#L28)

Estimates supply APY from a current RAY-scaled APR.

The estimate uses the protocol's scheduled 15-second pool synchronization
interval and assumes the current APR remains unchanged for a 365-day year.
Additional protocol activity can synchronize a pool between timer ticks, so
this is not a realized-yield guarantee.

## Parameters

### supplyApr

`bigint`

## Returns

`bigint`
