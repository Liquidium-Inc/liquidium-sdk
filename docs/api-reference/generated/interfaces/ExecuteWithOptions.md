[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ExecuteWithOptions

# Interface: ExecuteWithOptions

Defined in: [packages/client/src/execute.ts:19](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/execute.ts#L19)

Wallet wiring for [executeWith](../functions/executeWith.md).

`chain` and `account` override values embedded on the action when present;
message signing uses `options.account ?? action.account`.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/execute.ts:25](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/execute.ts#L25)

Optional signing/sending account override.

***

### chain?

> `optional` **chain?**: [`SigningChain`](../type-aliases/SigningChain.md)

Defined in: [packages/client/src/execute.ts:23](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/execute.ts#L23)

Required for `sign-message` actions; forwarded to the adapter and submit payload.

***

### walletAdapter

> **walletAdapter**: [`WalletAdapter`](WalletAdapter.md)

Defined in: [packages/client/src/execute.ts:21](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/execute.ts#L21)

Must expose the methods required by the action's `executionKind`.
