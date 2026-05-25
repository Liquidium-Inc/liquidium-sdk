[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignPsbtRequest

# Interface: SignPsbtRequest

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:58](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L58)

PSBT-signing request passed to BTC wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:64](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L64)

Optional BTC account override.

***

### actionType

> **actionType**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:66](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L66)

SDK action type that produced this request.

***

### chain

> **chain**: `"BTC"`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:60](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L60)

BTC chain discriminator.

***

### psbtBase64

> **psbtBase64**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:62](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L62)

Base64-encoded unsigned PSBT.

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:68](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L68)

Transfer path associated with the action.
