[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WithdrawAction

# Interface: WithdrawAction

Defined in: [packages/client/src/modules/lending/types.ts:241](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L241)

Prepared action for creating a withdraw outflow.

## Extends

- [`SignMessageWalletAction`](SignMessageWalletAction.md)\<[`CreateWithdrawData`](CreateWithdrawData.md), [`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:156](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L156)

Default account to pass to the wallet adapter.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`account`](SignMessageWalletAction.md#account)

***

### actionType

> **actionType**: `"create-withdraw"`

Defined in: [packages/client/src/modules/lending/types.ts:248](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L248)

Adapter-facing action type.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`actionType`](SignMessageWalletAction.md#actiontype)

***

### data

> **data**: [`CreateWithdrawData`](CreateWithdrawData.md)

Defined in: [packages/client/src/core/wallet-actions.ts:160](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L160)

Original request data needed to submit the signed action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`data`](SignMessageWalletAction.md#data)

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/modules/lending/types.ts:246](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L246)

Required wallet capability.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`executionKind`](SignMessageWalletAction.md#executionkind)

***

### kind

> **kind**: `"create-withdraw"`

Defined in: [packages/client/src/modules/lending/types.ts:244](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L244)

Protocol action kind.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`kind`](SignMessageWalletAction.md#kind)

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:158](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L158)

Plaintext message that must be signed.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`message`](SignMessageWalletAction.md#message)

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/core/wallet-actions.ts:154](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L154)

Transfer path associated with the action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`transferMode`](SignMessageWalletAction.md#transfermode)

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<[`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

Defined in: [packages/client/src/core/wallet-actions.ts:162](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L162)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<[`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`submit`](SignMessageWalletAction.md#submit)
