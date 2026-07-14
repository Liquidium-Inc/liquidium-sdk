[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateAccountAction

# Interface: CreateAccountAction

Defined in: [packages/client/src/modules/accounts/types.ts:33](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L33)

Prepared action for creating a Liquidium profile.

## Extends

- [`SignMessageWalletAction`](SignMessageWalletAction.md)\<[`CreateAccountData`](CreateAccountData.md), `string`\>

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L138)

Default account to pass to the wallet adapter.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`account`](SignMessageWalletAction.md#account)

***

### actionType

> **actionType**: `"create-account"`

Defined in: [packages/client/src/modules/accounts/types.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L40)

Adapter-facing action type.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`actionType`](SignMessageWalletAction.md#actiontype)

***

### data

> **data**: [`CreateAccountData`](CreateAccountData.md)

Defined in: [packages/client/src/core/wallet-actions.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L142)

Original request data needed to submit the signed action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`data`](SignMessageWalletAction.md#data)

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/modules/accounts/types.ts:38](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L38)

Required wallet capability.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`executionKind`](SignMessageWalletAction.md#executionkind)

***

### kind

> **kind**: `"create-account"`

Defined in: [packages/client/src/modules/accounts/types.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L36)

Protocol action kind.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`kind`](SignMessageWalletAction.md#kind)

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L140)

Plaintext message that must be signed.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`message`](SignMessageWalletAction.md#message)

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:144](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L144)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`submit`](SignMessageWalletAction.md#submit)
