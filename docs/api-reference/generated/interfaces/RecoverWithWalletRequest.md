[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / RecoverWithWalletRequest

# Interface: RecoverWithWalletRequest

Defined in: packages/client/src/modules/lending/types.ts:206

Wallet dependencies for recovery through a linked BTC, ETH, or SOL account.

## Extends

- [`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`WalletExecutionParams`](WalletExecutionParams.md)

## Properties

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/lending/types.ts:165

Delivery chain; use ICP for chain-key assets.

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`chain`](PrepareRecoveryRequest.md#chain)

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:163

Pool principal text. Recovery balances are grouped by pool.

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`poolId`](PrepareRecoveryRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:161

Liquidium profile principal text.

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`profileId`](PrepareRecoveryRequest.md#profileid)

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: packages/client/src/modules/lending/types.ts:167

Destination that receives recovered funds after fees.

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`receiver`](PrepareRecoveryRequest.md#receiver)

***

### signerChain

> **signerChain**: [`SigningChain`](../type-aliases/SigningChain.md)

Defined in: packages/client/src/modules/lending/types.ts:25

Chain used by the signing wallet.

#### Inherited from

[`WalletExecutionParams`](WalletExecutionParams.md).[`signerChain`](WalletExecutionParams.md#signerchain)

***

### signerWalletAdapter

> **signerWalletAdapter**: [`WalletAdapter`](WalletAdapter.md)

Defined in: packages/client/src/modules/lending/types.ts:27

Wallet adapter used to execute the prepared action.

#### Inherited from

[`WalletExecutionParams`](WalletExecutionParams.md).[`signerWalletAdapter`](WalletExecutionParams.md#signerwalletadapter)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:172

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`signerWalletAddress`](PrepareRecoveryRequest.md#signerwalletaddress)
