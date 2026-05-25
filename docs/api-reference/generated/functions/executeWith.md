[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / executeWith

# Function: executeWith()

> **executeWith**(`options`): \<`TResult`\>(`action`) => `Promise`\<`TResult`\>

Defined in: [external/liquidium-sdk/packages/client/src/execute.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/execute.ts#L34)

Returns an async function that runs a [WalletAction](../type-aliases/WalletAction.md) end-to-end.

- `sign-message`: needs `walletAdapter.signMessage` and `options.chain`.
- `sign-psbt`: needs `walletAdapter.signPsbt`.
- `send-eth-transaction`: needs `walletAdapter.sendEthTransaction`.

## Parameters

### options

[`ExecuteWithOptions`](../interfaces/ExecuteWithOptions.md)

Adapter and optional chain/account overrides.

## Returns

A function that accepts a `WalletAction` and resolves with its submit result.

\<`TResult`\>(`action`) => `Promise`\<`TResult`\>
