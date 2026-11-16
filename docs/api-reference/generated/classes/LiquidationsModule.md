[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidationsModule

# Class: LiquidationsModule

Defined in: packages/client/src/modules/liquidations/liquidations.ts:24

Liquidation candidate scanning, execution, and status lookup.

## Constructors

### Constructor

> **new LiquidationsModule**(`canisterContext`): `LiquidationsModule`

Defined in: packages/client/src/modules/liquidations/liquidations.ts:25

#### Parameters

##### canisterContext

`CanisterContext`

#### Returns

`LiquidationsModule`

## Methods

### getLiquidation()

> **getLiquidation**(`liquidationId`): `Promise`\<[`LiquidationResult`](../interfaces/LiquidationResult.md)\>

Defined in: packages/client/src/modules/liquidations/liquidations.ts:182

Gets the current status of a liquidation by its canister id.

#### Parameters

##### liquidationId

`bigint`

Non-negative canister-assigned liquidation id.

#### Returns

`Promise`\<[`LiquidationResult`](../interfaces/LiquidationResult.md)\>

The current liquidation result, including pending refund transfers.

***

### liquidate()

> **liquidate**(`request`): `Promise`\<[`LiquidationResult`](../interfaces/LiquidationResult.md)\>

Defined in: packages/client/src/modules/liquidations/liquidations.ts:92

Executes a liquidation with automatic debt-ledger allowance handling.

The canister enforces `minCollateralAmount` only on bad-debt and hybrid
paths. Normal collateral-backed liquidations ignore it and allow partial
fills. Setting `buyBadDebt: true` permits, but does not force, a bad-debt path.

The configured signing IC identity or agent is the liquidator.
Liquidator registration is not required. A sufficient allowance with no
expiry or more than one minute remaining is reused; otherwise the SDK
approves the debt amount plus the transfer fee
for five minutes before submission. Approval incurs a separate ledger fee.

#### Parameters

##### request

[`ExecuteLiquidationRequest`](../interfaces/ExecuteLiquidationRequest.md)

Borrower, pools, debt amount, collateral receiver, and minimum collateral.

#### Returns

`Promise`\<[`LiquidationResult`](../interfaces/LiquidationResult.md)\>

The current liquidation result. Failed lifecycle states remain results.

***

### scan()

> **scan**(`request`): `Promise`\<[`LiquidationScanResult`](../interfaces/LiquidationScanResult.md)\>

Defined in: packages/client/src/modules/liquidations/liquidations.ts:33

Scans borrower accounts for positions below the liquidation threshold.

#### Parameters

##### request

[`ScanLiquidationsRequest`](../interfaces/ScanLiquidationsRequest.md)

Optional cursor, accounts to scan, and candidates to return.

#### Returns

`Promise`\<[`LiquidationScanResult`](../interfaces/LiquidationScanResult.md)\>

Liquidation candidates and the cursor for the next scan page.
