[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / estimateBorrowApy

# Function: estimateBorrowApy()

> **estimateBorrowApy**(`borrowApr`): `bigint`

Defined in: [packages/client/src/core/rates.ts:16](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/rates.ts#L16)

Estimates borrow APY from a current RAY-scaled APR.

The estimate mirrors the protocol's per-second borrow compounding and assumes
the current APR remains unchanged for a 365-day year.

## Parameters

### borrowApr

`bigint`

## Returns

`bigint`
