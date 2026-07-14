[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / intFromPublicId

# Function: intFromPublicId()

> **intFromPublicId**(`ref`): `bigint`

Defined in: [packages/client/src/modules/simple-loans/ref-code.ts:33](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/ref-code.ts#L33)

Decodes a short user-facing reference back into the canister loan id.

## Parameters

### ref

`string`

Fixed-length public reference string.

## Returns

`bigint`

Canister loan id represented by the reference.
