[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ExecuteWithOptions

# Interface: ExecuteWithOptions

Defined in: [external/liquidium-sdk/packages/client/src/execute.ts:15](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/execute.ts#L15)

Wallet wiring for [executeWith](../functions/executeWith.md).

`chain` and `account` override values embedded on the action when present;
message signing uses `options.account ?? action.account`.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/execute.ts:21](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/execute.ts#L21)

Optional signing/sending account override.

***

### chain?

> `optional` **chain?**: [`Chain`](../type-aliases/Chain.md)

Defined in: [external/liquidium-sdk/packages/client/src/execute.ts:19](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/execute.ts#L19)

Required for `sign-message` actions; forwarded to the adapter and submit payload.

***

### walletAdapter

> **walletAdapter**: [`WalletAdapter`](WalletAdapter.md)

Defined in: [external/liquidium-sdk/packages/client/src/execute.ts:17](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/execute.ts#L17)

Must expose the methods required by the action's `executionKind`.
