[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcTransferDetails

# Interface: IcrcTransferDetails

Defined in: packages/client/src/core/wallet-actions.ts:73

ICRC ledger transfer payload passed to wallet adapters.

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/core/wallet-actions.ts:79

Transfer amount in ledger base units.

***

### fee?

> `optional` **fee?**: `bigint`

Defined in: packages/client/src/core/wallet-actions.ts:81

Optional ledger fee in base units.

***

### ledgerCanisterId

> **ledgerCanisterId**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:75

Ledger canister principal that should receive the transfer call.

***

### memo?

> `optional` **memo?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: packages/client/src/core/wallet-actions.ts:83

Optional ledger memo bytes.

***

### to

> **to**: [`IcrcAccount`](IcrcAccount.md)

Defined in: packages/client/src/core/wallet-actions.ts:77

Recipient ICRC account.
