[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / AccountsModule

# Class: AccountsModule

Defined in: [packages/client/src/modules/accounts/accounts.ts:31](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/accounts.ts#L31)

Profile lifecycle and linked-wallet helpers.

## Constructors

### Constructor

> **new AccountsModule**(`canisterContext`): `AccountsModule`

Defined in: [packages/client/src/modules/accounts/accounts.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/accounts.ts#L32)

#### Parameters

##### canisterContext

`CanisterContext`

#### Returns

`AccountsModule`

## Methods

### createProfile()

> **createProfile**(`params`): `Promise`\<`string`\>

Defined in: [packages/client/src/modules/accounts/accounts.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/accounts.ts#L56)

Creates a Liquidium profile using the provided wallet adapter.

This is the convenience form of `prepareCreateProfile(...)` plus execution.

#### Parameters

##### params

[`CreateProfileParams`](../interfaces/CreateProfileParams.md)

Wallet `account`, signing `chain`, and `walletAdapter` with `signMessage`.

#### Returns

`Promise`\<`string`\>

The new profile principal as text.

***

### getProfileId()

> **getProfileId**(`walletAddress`): `Promise`\<`string` \| `null`\>

Defined in: [packages/client/src/modules/accounts/accounts.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/accounts.ts#L75)

Resolves the Liquidium profile id linked to a wallet address.

#### Parameters

##### walletAddress

`string`

Wallet address string as registered with the protocol.

#### Returns

`Promise`\<`string` \| `null`\>

Profile principal text, or `null` if none exists.

***

### getWalletNonce()

> **getWalletNonce**(`walletAddress`): `Promise`\<`bigint`\>

Defined in: [packages/client/src/modules/accounts/accounts.ts:100](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/accounts.ts#L100)

Returns the current nonce for a wallet address.

This is mainly useful for custom signing flows built on prepared actions.

#### Parameters

##### walletAddress

`string`

Wallet address used in `get_nonce` on the lending canister.

#### Returns

`Promise`\<`bigint`\>

The next signing nonce as a bigint.

***

### listLinkedWallets()

> **listLinkedWallets**(`profileId`): `Promise`\<[`Wallet`](../interfaces/Wallet.md)[]\>

Defined in: [packages/client/src/modules/accounts/accounts.ts:119](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/accounts.ts#L119)

Lists the wallets currently linked to a profile.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

#### Returns

`Promise`\<[`Wallet`](../interfaces/Wallet.md)[]\>

The wallets currently linked to the requested profile.

***

### prepareCreateProfile()

> **prepareCreateProfile**(`options`): `Promise`\<[`CreateAccountAction`](../interfaces/CreateAccountAction.md)\>

Defined in: [packages/client/src/modules/accounts/accounts.ts:42](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/accounts.ts#L42)

Prepares a profile-creation action that can be signed and submitted later.

Use this when you need direct control over the signing flow.

#### Parameters

##### options

[`PrepareCreateProfileOptions`](../interfaces/PrepareCreateProfileOptions.md)

`account` is the wallet address that will own the new profile.

#### Returns

`Promise`\<[`CreateAccountAction`](../interfaces/CreateAccountAction.md)\>

A signable [CreateAccountAction](../interfaces/CreateAccountAction.md) with `submit` wired to the canister.
