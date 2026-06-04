[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateProfileParams

# Interface: CreateProfileParams

Defined in: [packages/client/src/modules/accounts/types.ts:19](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L19)

Parameters for creating a profile through a wallet adapter.

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/accounts/types.ts:21](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L21)

Wallet address that will own the new profile.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/accounts/types.ts:23](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L23)

Chain used to sign the profile-creation message.

***

### walletAdapter

> **walletAdapter**: [`WalletAdapter`](WalletAdapter.md)

Defined in: [packages/client/src/modules/accounts/types.ts:25](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L25)

Wallet adapter used to sign the profile-creation message.
