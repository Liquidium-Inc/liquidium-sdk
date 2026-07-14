[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WithdrawAction

# Interface: WithdrawAction

Defined in: [packages/client/src/modules/lending/types.ts:144](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L144)

Prepared action for creating a withdraw outflow.

## Extends

- [`SignMessageWalletAction`](SignMessageWalletAction.md)\<[`CreateWithdrawData`](CreateWithdrawData.md), [`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L138)

Default account to pass to the wallet adapter.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`account`](SignMessageWalletAction.md#account)

***

### actionType

> **actionType**: `"create-withdraw"`

Defined in: [packages/client/src/modules/lending/types.ts:151](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L151)

Adapter-facing action type.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`actionType`](SignMessageWalletAction.md#actiontype)

***

### data

> **data**: [`CreateWithdrawData`](CreateWithdrawData.md)

Defined in: [packages/client/src/core/wallet-actions.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L142)

Original request data needed to submit the signed action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`data`](SignMessageWalletAction.md#data)

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/modules/lending/types.ts:149](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L149)

Required wallet capability.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`executionKind`](SignMessageWalletAction.md#executionkind)

***

### kind

> **kind**: `"create-withdraw"`

Defined in: [packages/client/src/modules/lending/types.ts:147](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L147)

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

> **submit**(`signatureInfo`): `Promise`\<[`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

Defined in: [packages/client/src/core/wallet-actions.ts:144](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L144)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<[`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`submit`](SignMessageWalletAction.md#submit)
