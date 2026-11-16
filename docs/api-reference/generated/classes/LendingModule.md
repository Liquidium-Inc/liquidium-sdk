[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LendingModule

# Class: LendingModule

Defined in: packages/client/src/modules/lending/lending.ts:131

Borrow, withdraw, recovery, supply, inflow reporting, and fee-estimation helpers.

## Constructors

### Constructor

> **new LendingModule**(`canisterContext`, `apiClient`, `evmReadClient`): `LendingModule`

Defined in: packages/client/src/modules/lending/lending.ts:132

#### Parameters

##### canisterContext

`CanisterContext`

##### apiClient

`ApiClient` \| `undefined`

##### evmReadClient

[`EvmReadClient`](../interfaces/EvmReadClient.md) \| `undefined`

#### Returns

`LendingModule`

## Methods

### borrow()

> **borrow**(`params`): `Promise`\<[`BorrowOutflowDetails`](../type-aliases/BorrowOutflowDetails.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:588

Creates a borrow outflow using the provided wallet adapter.

This is the convenience form of `prepareBorrow(...)` plus execution.
Same-asset policy validation runs before the wallet is asked to sign.

#### Parameters

##### params

[`CreateBorrowRequest`](../interfaces/CreateBorrowRequest.md) & [`WalletExecutionParams`](../interfaces/WalletExecutionParams.md)

Borrow request fields plus `signerChain` and `signerWalletAdapter`.

#### Returns

`Promise`\<[`BorrowOutflowDetails`](../type-aliases/BorrowOutflowDetails.md)\>

The lending canister receipt as [OutflowDetails](../interfaces/OutflowDetails.md).

#### Throws

[LiquidiumError](LiquidiumError.md) If SDK validation or protocol submission
fails.

#### Throws

`Error` If the wallet adapter rejects message signing.

#### Remarks

`id` is always present. `txid` may be missing on the first response; the SDK does not
poll for it. Use history or app-level polling if you need the chain transaction id.

***

### estimateInflowFee()

> **estimateInflowFee**(`request`): `Promise`\<[`InflowFeeEstimate`](../interfaces/InflowFeeEstimate.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:707

Estimates the network/deposit fee for an inflow target.

ETH-chain deposit-address estimates are served by the deposit-address
canister. BTC estimates include the ckBTC minter deposit fee and ledger fee.
SOL and ckSOL use account-specific SDK API quotes, including minimum sends.
Other ICP-chain estimates return the corresponding ICRC ledger fee.

#### Parameters

##### request

[`EstimateInflowFeeRequest`](../type-aliases/EstimateInflowFeeRequest.md)

Asset and chain pair to estimate for.

#### Returns

`Promise`\<[`InflowFeeEstimate`](../interfaces/InflowFeeEstimate.md)\>

Total fee estimate rounded up in the asset's base units.

***

### getDepositAddress()

> **getDepositAddress**(`request`): `Promise`\<`string`\>

Defined in: packages/client/src/modules/lending/lending.ts:646

Returns the read-only deposit address for an ETH-chain inflow target.

This is a query call that does not create or mutate state. Use it when you
need the deposit address without hitting the authorization-gated update path.

#### Parameters

##### request

[`GetDepositAddressRequest`](../interfaces/GetDepositAddressRequest.md)

Profile, pool, asset, and supply action.

#### Returns

`Promise`\<`string`\>

The EVM deposit address for the derived account.

***

### getEvmSupplyContext()

> **getEvmSupplyContext**(`request`): `Promise`\<[`EvmSupplyContext`](../interfaces/EvmSupplyContext.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:631

Fetches ERC-20 supply planning data with the configured EVM read client.

Requires `evmRpcUrl` or `evmPublicClient` on the client. Used internally by
contract-interaction `supply`.

#### Parameters

##### request

[`GetEvmSupplyContextRequest`](../interfaces/GetEvmSupplyContextRequest.md)

Profile, pool, wallet, amount (token base units), and action.

#### Returns

`Promise`\<[`EvmSupplyContext`](../interfaces/EvmSupplyContext.md)\>

Locally computed [EvmSupplyContext](../interfaces/EvmSupplyContext.md) for approvals and deposit.

***

### getRecoveryBalance()

> **getRecoveryBalance**(`profileId`, `poolId`): `Promise`\<`bigint`\>

Defined in: packages/client/src/modules/lending/lending.ts:143

Reads the profile's live recovery balance in pool asset base units.
Includes excess repayments and rejected inflows once refund delivery settles.
Does not require a position, a rejection history entry, or authorization.

#### Parameters

##### profileId

`string`

##### poolId

`string`

#### Returns

`Promise`\<`bigint`\>

***

### isBorrowingDisabled()

> **isBorrowingDisabled**(): `Promise`\<`boolean`\>

Defined in: packages/client/src/modules/lending/lending.ts:814

Returns whether borrowing is currently disabled by the protocol.

#### Returns

`Promise`\<`boolean`\>

`true` when the lending canister reports borrowing disabled.

***

### prepareBorrow()

> **prepareBorrow**(`request`): `Promise`\<[`BorrowAction`](../interfaces/BorrowAction.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:402

Prepares a borrow action that can be signed and submitted later.

Use this when you need explicit control over signing and submission.
When the selected pool disables same-asset borrowing, preparation rejects
profiles whose supplied balance in that pool is at or above its dust threshold.

#### Parameters

##### request

[`CreateBorrowRequest`](../interfaces/CreateBorrowRequest.md)

Profile, pool, amount (borrow asset base units), outflow address, and signer wallet.

#### Returns

`Promise`\<[`BorrowAction`](../interfaces/BorrowAction.md)\>

A signable [BorrowAction](../interfaces/BorrowAction.md) with `submit` wired to the canister.

#### Throws

[LiquidiumError](LiquidiumError.md) If request validation, destination
validation, or protocol preparation fails.

***

### prepareRecovery()

> **prepareRecovery**(`request`): `Promise`\<[`RecoveryAction`](../interfaces/RecoveryAction.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:152

Prepares withdrawal of the current full recovery balance for BTC/ETH/SOL signing.
Checks destination fees before signing and again before submission.
The signed amount stays fixed if more funds arrive after preparation.

#### Parameters

##### request

[`PrepareRecoveryRequest`](../interfaces/PrepareRecoveryRequest.md)

#### Returns

`Promise`\<[`RecoveryAction`](../interfaces/RecoveryAction.md)\>

***

### prepareWithdraw()

> **prepareWithdraw**(`request`): `Promise`\<[`WithdrawAction`](../interfaces/WithdrawAction.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:196

Prepares a withdraw action that can be signed and submitted later.

Use this when you need explicit control over signing and submission.

#### Parameters

##### request

[`CreateWithdrawRequest`](../interfaces/CreateWithdrawRequest.md)

Profile, pool, amount (pool asset base units), outflow address, and signer wallet.

#### Returns

`Promise`\<[`WithdrawAction`](../interfaces/WithdrawAction.md)\>

A signable [WithdrawAction](../interfaces/WithdrawAction.md) with `submit` wired to the canister.

#### Throws

[LiquidiumError](LiquidiumError.md) If request validation, destination
validation, or protocol preparation fails.

***

### recover()

> **recover**(`request`): `Promise`\<[`RecoveryResult`](../interfaces/RecoveryResult.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:165

Withdraws the current recovery balance using a linked wallet or ICP caller.
ICP authorization uses its agent only for the update; reads use the client's agent.
The receipt records the recovery transfer. For pools other than ICP, final
delivery happens later. A `CANISTER_REJECTED` error can follow an update
that succeeded, so read the balance again before you retry.

#### Parameters

##### request

[`RecoverRequest`](../type-aliases/RecoverRequest.md)

#### Returns

`Promise`\<[`RecoveryResult`](../interfaces/RecoveryResult.md)\>

***

### submitInflow()

> **submitInflow**(`request`): `Promise`\<[`SubmitInflowResponse`](../interfaces/SubmitInflowResponse.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:782

Submits an inflow transaction id for faster indexing.

Uses the Liquidium SDK API.

#### Parameters

##### request

[`SubmitInflowRequest`](../interfaces/SubmitInflowRequest.md)

Broadcast `txid` plus inflow `operation` and optional `chain`.

#### Returns

`Promise`\<[`SubmitInflowResponse`](../interfaces/SubmitInflowResponse.md)\>

Acknowledgement including the submitted `txid`.

#### Throws

[LiquidiumError](LiquidiumError.md) If the chain is unsupported or the API
request fails.

***

### supply()

> **supply**(`request`): `Promise`\<[`SupplyFlow`](../interfaces/SupplyFlow.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:618

Resolves a supply target for a deposit or repayment and optionally broadcasts it.

Transfer mode can return manual broadcast instructions when wallet fields are
omitted. Contract-interaction mode always requires `walletAdapter`, `account`,
and `amount` because it must prepare and submit approval/deposit calls.

The SDK does not poll for inflow status. When a `txid` is returned, it is the
caller's responsibility to track confirmation state using their own polling.

#### Parameters

##### request

[`SupplyFlowRequest`](../type-aliases/SupplyFlowRequest.md)

#### Returns

`Promise`\<[`SupplyFlow`](../interfaces/SupplyFlow.md)\>

A [SupplyFlow](../interfaces/SupplyFlow.md) receipt with `type`, `target`, `submit`, and
  an optional `txid` present when the SDK broadcast for you.

#### Throws

[LiquidiumError](LiquidiumError.md) If validation, transfer planning, or
protocol submission fails. Repayments throw `NO_OUTSTANDING_DEBT` before
returning a target when the profile has no debt in the pool.

#### Throws

`Error` If the wallet adapter rejects or fails to broadcast a
transaction.

***

### withdraw()

> **withdraw**(`params`): `Promise`\<[`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

Defined in: packages/client/src/modules/lending/lending.ts:378

Creates a withdraw outflow using the provided wallet adapter.

This is the convenience form of `prepareWithdraw(...)` plus execution.

#### Parameters

##### params

[`CreateWithdrawRequest`](../interfaces/CreateWithdrawRequest.md) & [`WalletExecutionParams`](../interfaces/WalletExecutionParams.md)

Withdraw request fields plus `signerChain` and `signerWalletAdapter`.

#### Returns

`Promise`\<[`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

The canister [OutflowDetails](../interfaces/OutflowDetails.md) for the completed withdraw.

#### Throws

[LiquidiumError](LiquidiumError.md) If SDK validation or protocol submission
fails.

#### Throws

`Error` If the wallet adapter rejects message signing.
