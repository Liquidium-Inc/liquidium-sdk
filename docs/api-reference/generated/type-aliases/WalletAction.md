[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletAction

# Type Alias: WalletAction\<TResult\>

> **WalletAction**\<`TResult`\> = [`SignMessageWalletAction`](../interfaces/SignMessageWalletAction.md)\<`unknown`, `TResult`\> \| [`SignPsbtWalletAction`](../interfaces/SignPsbtWalletAction.md)\<`TResult`\> \| [`SendEthTransactionWalletAction`](../interfaces/SendEthTransactionWalletAction.md)\<`TResult`\>

Defined in: [packages/client/src/core/wallet-actions.ts:199](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L199)

Any prepared action returned by SDK methods and executable by [executeWith](../functions/executeWith.md).

## Type Parameters

### TResult

`TResult`
