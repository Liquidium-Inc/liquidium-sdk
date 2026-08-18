[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / executeWith

# Function: executeWith()

> **executeWith**(`options`): \<`TResult`\>(`action`) => `Promise`\<`TResult`\>

Defined in: packages/client/src/execute.ts:39

Returns an async function that runs a [WalletAction](../type-aliases/WalletAction.md) end-to-end.

- `sign-message`: needs `walletAdapter.signMessage` and `options.chain`.

## Parameters

### options

[`ExecuteWithOptions`](../interfaces/ExecuteWithOptions.md)

Adapter and optional chain/account overrides.

## Returns

A function that accepts a `WalletAction` and resolves with its submit result.

\<`TResult`\>(`action`) => `Promise`\<`TResult`\>

## Throws

[LiquidiumError](../classes/LiquidiumError.md) If a required wallet capability or signing
chain is missing.

## Throws

`Error` If the wallet adapter or action submission fails.
