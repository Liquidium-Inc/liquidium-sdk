[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitInflowResponse

# Interface: SubmitInflowResponse

Defined in: [packages/client/src/modules/lending/types.ts:347](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L347)

Acknowledgement from the SDK API after submitting an inflow hint.

## Properties

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/lending/types.ts:353](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L353)

Shared lifecycle status for the submitted inflow.

***

### success

> **success**: `true`

Defined in: [packages/client/src/modules/lending/types.ts:349](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L349)

Indicates the submit request was accepted by the SDK API.

***

### txid

> **txid**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:351](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L351)

Transaction id accepted by the SDK API.
