[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitInflowResponse

# Interface: SubmitInflowResponse

Defined in: [packages/client/src/modules/lending/types.ts:313](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L313)

Acknowledgement from the SDK API after submitting an inflow hint.

## Properties

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/lending/types.ts:319](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L319)

Shared lifecycle status for the submitted inflow.

***

### success

> **success**: `true`

Defined in: [packages/client/src/modules/lending/types.ts:315](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L315)

Indicates the submit request was accepted by the SDK API.

***

### txid

> **txid**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:317](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L317)

Transaction id accepted by the SDK API.
