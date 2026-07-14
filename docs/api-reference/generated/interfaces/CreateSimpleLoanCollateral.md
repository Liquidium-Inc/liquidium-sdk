[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateSimpleLoanCollateral

# Interface: CreateSimpleLoanCollateral

Defined in: [packages/client/src/modules/simple-loans/types.ts:13](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L13)

Collateral leg used when creating a simple loan.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:37](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L37)

Intended credited collateral amount, in base units.

This is used to validate LTV and initialize the loan record before
deposit/inflow fees are deducted. For BTC, pass satoshis. For token assets,
convert the UI amount using the selected pool's `decimals` value. After
creation, use one of `loan.initialDeposit.targets` as the fee-inclusive
transfer quote and destination.

***

### asset

> **asset**: `"BTC"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:27](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L27)

Asset the user will deposit as collateral.

Must match the asset for `poolId`; for example, use `"BTC"` with a BTC
collateral pool.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:20](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L20)

Principal text of the pool that receives the user's collateral deposit.

This should be the `id` of the collateral `Pool` selected from
`client.market.listPools()`. The pool asset must match `asset`.
