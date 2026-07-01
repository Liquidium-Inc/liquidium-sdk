[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcTransferDetails

# Interface: IcrcTransferDetails

Defined in: [packages/client/src/core/wallet-actions.ts:87](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L87)

ICRC ledger transfer payload passed to wallet adapters.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/core/wallet-actions.ts:93](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L93)

Transfer amount in ledger base units.

***

### fee?

> `optional` **fee?**: `bigint`

Defined in: [packages/client/src/core/wallet-actions.ts:95](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L95)

Optional ledger fee in base units.

***

### ledgerCanisterId

> **ledgerCanisterId**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:89](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L89)

Ledger canister principal that should receive the transfer call.

***

### memo?

> `optional` **memo?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: [packages/client/src/core/wallet-actions.ts:97](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L97)

Optional ledger memo bytes.

***

### to

> **to**: [`IcrcAccount`](IcrcAccount.md)

Defined in: [packages/client/src/core/wallet-actions.ts:91](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L91)

Recipient ICRC account.
