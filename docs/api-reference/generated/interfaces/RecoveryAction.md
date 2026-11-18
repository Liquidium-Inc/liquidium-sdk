[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / RecoveryAction

# Interface: RecoveryAction

Defined in: packages/client/src/modules/lending/types.ts:199

Prepared wallet-signature recovery action.

## Extends

- [`SignMessageWalletAction`](SignMessageWalletAction.md)\<[`RecoveryData`](RecoveryData.md), [`RecoveryResult`](RecoveryResult.md)\>

## Properties

### account

> **account**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:150

Default account to pass to the wallet adapter.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`account`](SignMessageWalletAction.md#account)

***

### actionType

> **actionType**: `"recover-funds"`

Defined in: packages/client/src/modules/lending/types.ts:202

Adapter-facing action type.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`actionType`](SignMessageWalletAction.md#actiontype)

***

### data

> **data**: [`RecoveryData`](RecoveryData.md)

Defined in: packages/client/src/core/wallet-actions.ts:154

Original request data needed to submit the signed action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`data`](SignMessageWalletAction.md#data)

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: packages/client/src/core/wallet-actions.ts:146

Wallet capability required to execute the action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`executionKind`](SignMessageWalletAction.md#executionkind)

***

### kind

> **kind**: `"recover-funds"`

Defined in: packages/client/src/modules/lending/types.ts:201

Protocol action kind.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`kind`](SignMessageWalletAction.md#kind)

***

### message

> **message**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:152

Plaintext message that must be signed.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`message`](SignMessageWalletAction.md#message)

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<[`RecoveryResult`](RecoveryResult.md)\>

Defined in: packages/client/src/core/wallet-actions.ts:156

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<[`RecoveryResult`](RecoveryResult.md)\>

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`submit`](SignMessageWalletAction.md#submit)
