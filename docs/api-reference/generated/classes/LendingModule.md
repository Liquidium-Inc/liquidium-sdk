[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LendingModule

# Class: LendingModule

Defined in: [packages/client/src/modules/lending/lending.ts:211](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L211)

Borrow, withdraw, supply, inflow reporting, and fee-estimation helpers.

## Constructors

### Constructor

> **new LendingModule**(`canisterContext`, `apiClient`, `evmReadClient`): `LendingModule`

Defined in: [packages/client/src/modules/lending/lending.ts:212](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L212)

#### Parameters

##### canisterContext

`CanisterContext`

##### apiClient

`ApiClient` \| `undefined`

##### evmReadClient

[`EvmReadClient`](../type-aliases/EvmReadClient.md) \| `undefined`

#### Returns

`LendingModule`

## Methods

### borrow()

> **borrow**(`params`): `Promise`\<[`BorrowOutflowDetails`](../type-aliases/BorrowOutflowDetails.md)\>

Defined in: [packages/client/src/modules/lending/lending.ts:506](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L506)

Creates a borrow outflow using the provided wallet adapter.

This is the convenience form of `prepareBorrow(...)` plus execution.

#### Parameters

##### params

[`CreateBorrowRequest`](../interfaces/CreateBorrowRequest.md) & [`WalletExecutionParams`](../interfaces/WalletExecutionParams.md)

Borrow request fields plus `signerChain` and `signerWalletAdapter`.

#### Returns

`Promise`\<[`BorrowOutflowDetails`](../type-aliases/BorrowOutflowDetails.md)\>

The lending canister receipt as [OutflowDetails](../interfaces/OutflowDetails.md).

#### Remarks

`id` is always present. `txid` may be missing on the first response; the SDK does not
poll for it. Use history or app-level polling if you need the chain transaction id.

***

### estimateInflowFee()

> **estimateInflowFee**(`request`): `Promise`\<[`InflowFeeEstimate`](../interfaces/InflowFeeEstimate.md)\>

Defined in: [packages/client/src/modules/lending/lending.ts:727](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L727)

Estimates the network/deposit fee for an inflow target.

ETH stablecoin deposit-address estimates are served by the deposit-address
canister. BTC estimates include the ckBTC minter deposit fee and ledger fee.

#### Parameters

##### request

[`EstimateInflowFeeRequest`](../interfaces/EstimateInflowFeeRequest.md)

Asset and chain pair to estimate for.

#### Returns

`Promise`\<[`InflowFeeEstimate`](../interfaces/InflowFeeEstimate.md)\>

Total fee estimate rounded up in the asset's base units.

***

### getDepositAddress()

> **getDepositAddress**(`request`): `Promise`\<`string`\>

Defined in: [packages/client/src/modules/lending/lending.ts:687](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L687)

Returns the read-only deposit address for an ETH stablecoin inflow target.

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

Defined in: [packages/client/src/modules/lending/lending.ts:601](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L601)

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

### isBorrowingDisabled()

> **isBorrowingDisabled**(): `Promise`\<`boolean`\>

Defined in: [packages/client/src/modules/lending/lending.ts:1107](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L1107)

Returns whether borrowing is currently disabled by the protocol.

#### Returns

`Promise`\<`boolean`\>

`true` when the lending canister reports borrowing disabled.

***

### prepareBorrow()

> **prepareBorrow**(`request`): `Promise`\<[`BorrowAction`](../interfaces/BorrowAction.md)\>

Defined in: [packages/client/src/modules/lending/lending.ts:366](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L366)

Prepares a borrow action that can be signed and submitted later.

Use this when you need explicit control over signing and submission.

#### Parameters

##### request

[`CreateBorrowRequest`](../interfaces/CreateBorrowRequest.md)

Profile, pool, amount (borrow asset base units), outflow address, and signer wallet.

#### Returns

`Promise`\<[`BorrowAction`](../interfaces/BorrowAction.md)\>

A signable [BorrowAction](../interfaces/BorrowAction.md) with `submit` wired to the canister.

***

### prepareWithdraw()

> **prepareWithdraw**(`request`): `Promise`\<[`WithdrawAction`](../interfaces/WithdrawAction.md)\>

Defined in: [packages/client/src/modules/lending/lending.ts:226](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L226)

Prepares a withdraw action that can be signed and submitted later.

Use this when you need explicit control over signing and submission.

#### Parameters

##### request

[`CreateWithdrawRequest`](../interfaces/CreateWithdrawRequest.md)

Profile, pool, amount (pool asset base units), outflow address, and signer wallet.

#### Returns

`Promise`\<[`WithdrawAction`](../interfaces/WithdrawAction.md)\>

A signable [WithdrawAction](../interfaces/WithdrawAction.md) with `submit` wired to the canister.

***

### submitInflow()

> **submitInflow**(`request`): `Promise`\<[`SubmitInflowResponse`](../interfaces/SubmitInflowResponse.md)\>

Defined in: [packages/client/src/modules/lending/lending.ts:1083](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L1083)

Submits an inflow transaction id for faster indexing.

Uses the Liquidium SDK API.

#### Parameters

##### request

[`SubmitInflowRequest`](../interfaces/SubmitInflowRequest.md)

Broadcast `txid` plus inflow `operation` and optional `chain`.

#### Returns

`Promise`\<[`SubmitInflowResponse`](../interfaces/SubmitInflowResponse.md)\>

Acknowledgement including the submitted `txid`.

***

### supply()

> **supply**(`request`): `Promise`\<[`SupplyFlow`](../interfaces/SupplyFlow.md)\>

Defined in: [packages/client/src/modules/lending/lending.ts:531](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L531)

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

***

### withdraw()

> **withdraw**(`params`): `Promise`\<[`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

Defined in: [packages/client/src/modules/lending/lending.ts:346](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/lending.ts#L346)

Creates a withdraw outflow using the provided wallet adapter.

This is the convenience form of `prepareWithdraw(...)` plus execution.

#### Parameters

##### params

[`CreateWithdrawRequest`](../interfaces/CreateWithdrawRequest.md) & [`WalletExecutionParams`](../interfaces/WalletExecutionParams.md)

Withdraw request fields plus `signerChain` and `signerWalletAdapter`.

#### Returns

`Promise`\<[`WithdrawOutflowDetails`](../type-aliases/WithdrawOutflowDetails.md)\>

The canister [OutflowDetails](../interfaces/OutflowDetails.md) for the completed withdraw.
