[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendIcrcTransferRequest

# Interface: SendIcrcTransferRequest

Defined in: [packages/client/src/core/wallet-actions.ts:87](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L87)

ICRC transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:95](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L95)

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:97](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L97)

SDK action type that produced this request.

***

### asset

> **asset**: [`Asset`](../type-aliases/Asset.md)

Defined in: [packages/client/src/core/wallet-actions.ts:91](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L91)

Asset represented by the target ledger transfer.

***

### chain

> **chain**: `"ICP"`

Defined in: [packages/client/src/core/wallet-actions.ts:89](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L89)

ICRC transfers are submitted on the Internet Computer.

***

### transfer

> **transfer**: [`IcrcTransferDetails`](IcrcTransferDetails.md)

Defined in: [packages/client/src/core/wallet-actions.ts:93](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L93)

Transfer details for the ledger call.
