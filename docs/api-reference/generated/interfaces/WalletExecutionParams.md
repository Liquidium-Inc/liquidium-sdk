[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletExecutionParams

# Interface: WalletExecutionParams

Defined in: packages/client/src/modules/lending/types.ts:23

Wallet execution dependencies for borrow and withdraw convenience methods.

## Extended by

- [`RecoverWithWalletRequest`](RecoverWithWalletRequest.md)

## Properties

### signerChain

> **signerChain**: [`SigningChain`](../type-aliases/SigningChain.md)

Defined in: packages/client/src/modules/lending/types.ts:25

Chain used by the signing wallet.

***

### signerWalletAdapter

> **signerWalletAdapter**: [`WalletAdapter`](WalletAdapter.md)

Defined in: packages/client/src/modules/lending/types.ts:27

Wallet adapter used to execute the prepared action.
