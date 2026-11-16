[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidationResult

# Interface: LiquidationResult

Defined in: packages/client/src/modules/liquidations/types.ts:168

Result returned by liquidation execution and status lookup.

## Properties

### amounts

> **amounts**: [`LiquidationAmounts`](LiquidationAmounts.md)

Defined in: packages/client/src/modules/liquidations/types.ts:174

Debt repaid and net collateral received.

***

### changeTx

> **changeTx**: [`LiquidationTransfer`](../type-aliases/LiquidationTransfer.md)

Defined in: packages/client/src/modules/liquidations/types.ts:182

Change or refund transfer to the calling principal.

***

### collateralAsset

> **collateralAsset**: [`LiquidationAsset`](../type-aliases/LiquidationAsset.md)

Defined in: packages/client/src/modules/liquidations/types.ts:178

Collateral asset sent to the receiver.

***

### collateralTx

> **collateralTx**: [`LiquidationTransfer`](../type-aliases/LiquidationTransfer.md)

Defined in: packages/client/src/modules/liquidations/types.ts:184

Seized collateral transfer to `receiverPrincipal`.

***

### debtAsset

> **debtAsset**: [`LiquidationAsset`](../type-aliases/LiquidationAsset.md)

Defined in: packages/client/src/modules/liquidations/types.ts:176

Debt asset spent by the liquidator.

***

### id

> **id**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:170

Canister-assigned liquidation id.

***

### status

> **status**: [`LiquidationStatus`](../type-aliases/LiquidationStatus.md)

Defined in: packages/client/src/modules/liquidations/types.ts:180

Liquidation lifecycle state.

***

### timestamp

> **timestamp**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:172

Unix timestamp in seconds.
