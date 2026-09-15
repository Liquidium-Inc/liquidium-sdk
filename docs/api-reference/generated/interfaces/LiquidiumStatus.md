[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidiumStatus

# Interface: LiquidiumStatus

Defined in: packages/client/src/core/status.ts:20

Shared lifecycle status returned by SDK methods that expose flow state.

## Properties

### confirmations

> **confirmations**: `number` \| `null`

Defined in: packages/client/src/core/status.ts:26

Confirmation progress while confirming, capped at the required count.

***

### operation

> **operation**: [`LiquidiumOperation`](../type-aliases/LiquidiumOperation.md)

Defined in: packages/client/src/core/status.ts:22

Operation currently represented by the status.

***

### requiredConfirmations

> **requiredConfirmations**: `number` \| `null`

Defined in: packages/client/src/core/status.ts:28

Required confirmations while confirming, otherwise null.

***

### state

> **state**: [`LiquidiumState`](../type-aliases/LiquidiumState.md)

Defined in: packages/client/src/core/status.ts:24

Current lifecycle state for the operation.
