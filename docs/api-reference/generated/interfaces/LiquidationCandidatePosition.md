[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidationCandidatePosition

# Interface: LiquidationCandidatePosition

Defined in: packages/client/src/modules/liquidations/types.ts:17

One pool position returned for a liquidatable borrower.

## Properties

### asset

> **asset**: [`Asset`](../type-aliases/Asset.md)

Defined in: packages/client/src/modules/liquidations/types.ts:21

Pool asset symbol.

***

### assetType

> **assetType**: [`LiquidationAsset`](../type-aliases/LiquidationAsset.md)

Defined in: packages/client/src/modules/liquidations/types.ts:23

Chain-key ledger route or unknown asset type.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:25

Current collateral in pool-asset base units.

***

### debtAmount

> **debtAmount**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:27

Current debt in pool-asset base units.

***

### liquidationBonusBps

> **liquidationBonusBps**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:29

Liquidation bonus in basis points.

***

### liquidationThresholdBps

> **liquidationThresholdBps**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:31

Liquidation threshold in basis points.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/liquidations/types.ts:19

Pool principal text.

***

### protocolFeeBps

> **protocolFeeBps**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:33

Protocol fee on the liquidation bonus in basis points.
