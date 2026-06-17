[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SubmitInflowResponse

# Interface: SubmitInflowResponse

Defined in: [packages/client/src/modules/lending/types.ts:322](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L322)

Acknowledgement from the SDK API after submitting an inflow hint.

## Properties

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/lending/types.ts:328](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L328)

Shared lifecycle status for the submitted inflow.

***

### success

> **success**: `true`

Defined in: [packages/client/src/modules/lending/types.ts:324](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L324)

Indicates the submit request was accepted by the SDK API.

***

### txid

> **txid**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:326](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L326)

Transaction id accepted by the SDK API.
