[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BorrowAction

# Interface: BorrowAction

Defined in: [packages/client/src/modules/lending/types.ts:127](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L127)

Prepared action for creating a borrow outflow.

## Extends

- [`SignMessageWalletAction`](SignMessageWalletAction.md)\<[`CreateBorrowData`](CreateBorrowData.md), [`BorrowOutflowDetails`](../type-aliases/BorrowOutflowDetails.md)\>

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:153](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L153)

Default account to pass to the wallet adapter.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`account`](SignMessageWalletAction.md#account)

***

### actionType

> **actionType**: `"create-borrow"`

Defined in: [packages/client/src/modules/lending/types.ts:134](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L134)

Adapter-facing action type.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`actionType`](SignMessageWalletAction.md#actiontype)

***

### data

> **data**: [`CreateBorrowData`](CreateBorrowData.md)

Defined in: [packages/client/src/core/wallet-actions.ts:157](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L157)

Original request data needed to submit the signed action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`data`](SignMessageWalletAction.md#data)

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/modules/lending/types.ts:132](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L132)

Required wallet capability.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`executionKind`](SignMessageWalletAction.md#executionkind)

***

### kind

> **kind**: `"create-borrow"`

Defined in: [packages/client/src/modules/lending/types.ts:130](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L130)

Protocol action kind.

#### Overrides

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`kind`](SignMessageWalletAction.md#kind)

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:155](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L155)

Plaintext message that must be signed.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`message`](SignMessageWalletAction.md#message)

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/core/wallet-actions.ts:151](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L151)

Transfer path associated with the action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`transferMode`](SignMessageWalletAction.md#transfermode)

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<[`BorrowOutflowDetails`](../type-aliases/BorrowOutflowDetails.md)\>

Defined in: [packages/client/src/core/wallet-actions.ts:159](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L159)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<[`BorrowOutflowDetails`](../type-aliases/BorrowOutflowDetails.md)\>

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`submit`](SignMessageWalletAction.md#submit)
