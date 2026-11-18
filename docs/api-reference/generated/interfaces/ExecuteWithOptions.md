[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ExecuteWithOptions

# Interface: ExecuteWithOptions

Defined in: packages/client/src/execute.ts:20

Wallet wiring for [executeWith](../functions/executeWith.md).

`chain` and `account` override values embedded on the action when present;
message signing uses `options.account ?? action.account`.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: packages/client/src/execute.ts:26

Optional signing/sending account override.

***

### chain?

> `optional` **chain?**: [`SigningChain`](../type-aliases/SigningChain.md)

Defined in: packages/client/src/execute.ts:24

Required for `sign-message` actions; forwarded to the adapter and submit payload.

***

### walletAdapter

> **walletAdapter**: [`WalletAdapter`](WalletAdapter.md)

Defined in: packages/client/src/execute.ts:22

Must expose the methods required by the action's `executionKind`.
