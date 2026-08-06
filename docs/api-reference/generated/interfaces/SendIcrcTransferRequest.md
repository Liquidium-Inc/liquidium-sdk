[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendIcrcTransferRequest

# Interface: SendIcrcTransferRequest

Defined in: packages/client/src/core/wallet-actions.ts:87

ICRC transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:95

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:97

SDK action type that produced this request.

***

### asset

> **asset**: [`Asset`](../type-aliases/Asset.md)

Defined in: packages/client/src/core/wallet-actions.ts:91

Asset represented by the target ledger transfer.

***

### chain

> **chain**: `"ICP"`

Defined in: packages/client/src/core/wallet-actions.ts:89

ICRC transfers are submitted on the Internet Computer.

***

### transfer

> **transfer**: [`IcrcTransferDetails`](IcrcTransferDetails.md)

Defined in: packages/client/src/core/wallet-actions.ts:93

Transfer details for the ledger call.
