[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidiumStatus

# Interface: LiquidiumStatus

Defined in: [packages/client/src/core/status.ts:20](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/status.ts#L20)

Shared lifecycle status returned by SDK methods that expose flow state.

## Properties

### confirmations

> **confirmations**: `number` \| `null`

Defined in: [packages/client/src/core/status.ts:26](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/status.ts#L26)

Observed chain confirmations, or null when unavailable or not applicable.

***

### operation

> **operation**: [`LiquidiumOperation`](../type-aliases/LiquidiumOperation.md)

Defined in: [packages/client/src/core/status.ts:22](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/status.ts#L22)

Operation currently represented by the status.

***

### requiredConfirmations

> **requiredConfirmations**: `number` \| `null`

Defined in: [packages/client/src/core/status.ts:28](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/status.ts#L28)

Required confirmations, or null when unavailable or not applicable.

***

### state

> **state**: [`LiquidiumState`](../type-aliases/LiquidiumState.md)

Defined in: [packages/client/src/core/status.ts:24](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/status.ts#L24)

Current lifecycle state for the operation.
