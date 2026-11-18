[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcTransferDetails

# Interface: IcrcTransferDetails

Defined in: packages/client/src/core/wallet-actions.ts:83

ICRC ledger transfer payload passed to wallet adapters.

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/core/wallet-actions.ts:89

Transfer amount in ledger base units.

***

### fee?

> `optional` **fee?**: `bigint`

Defined in: packages/client/src/core/wallet-actions.ts:91

Optional ledger fee in base units.

***

### ledgerCanisterId

> **ledgerCanisterId**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:85

Ledger canister principal that should receive the transfer call.

***

### memo?

> `optional` **memo?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: packages/client/src/core/wallet-actions.ts:93

Optional ledger memo bytes.

***

### to

> **to**: [`IcrcAccount`](IcrcAccount.md)

Defined in: packages/client/src/core/wallet-actions.ts:87

Recipient ICRC account.
