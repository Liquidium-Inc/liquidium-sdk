[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateProfileParams

# Interface: CreateProfileParams

Defined in: [packages/client/src/modules/accounts/types.ts:17](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L17)

Parameters for creating a profile through a wallet adapter.

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/accounts/types.ts:19](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L19)

Wallet address that will own the new profile.

***

### chain

> **chain**: [`SigningChain`](../type-aliases/SigningChain.md)

Defined in: [packages/client/src/modules/accounts/types.ts:21](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L21)

Chain used to sign the profile-creation message.

***

### walletAdapter

> **walletAdapter**: [`WalletAdapter`](WalletAdapter.md)

Defined in: [packages/client/src/modules/accounts/types.ts:23](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L23)

Wallet adapter used to sign the profile-creation message.
