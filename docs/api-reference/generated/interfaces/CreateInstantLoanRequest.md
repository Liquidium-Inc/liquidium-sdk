[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateInstantLoanRequest

# Interface: CreateInstantLoanRequest

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:54](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L54)

Parameters for creating an accountless instant loan.

Use market data from `client.market.listPools()` to choose the two pool ids,
and use `client.quote.calculateLtv(...)` before creation to validate the
amount pair and choose `ltvMaxBps`.

Amount fields are in each asset's smallest/base units. For example, BTC uses
satoshis and ERC-20 assets use token base units according to the selected
pool decimals.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:97](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L97)

Amount to borrow, in the borrow asset's base units.

For USDC/USDT, convert the UI amount using the selected borrow pool's
`decimals` value before passing it here.

***

### borrowAsset

> **borrowAsset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:82](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L82)

Asset the user wants to borrow from the borrow pool.

Must match the asset for `borrowPoolId`; for example, use `"USDC"` with a
USDC borrow pool.

***

### borrowDestination

> **borrowDestination**: `string` \| [`ExternalAccount`](ExternalAccount.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:122](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L122)

External destination that receives the borrowed asset after the loan starts.

Pass either an address string or `{ type: "External", address }`. This is
usually the user's wallet address on the borrow asset's chain, such as an
EVM address for ETH USDC/USDT outflows.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:68](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L68)

Principal text of the pool that funds the borrow.

This should be the `id` of the borrow `Pool` selected from
`client.market.listPools()`. The pool asset must match `borrowAsset`.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:90](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L90)

Amount the user is expected to deposit as collateral, in base units.

This is used to validate LTV and initialize the loan record. For BTC, pass
satoshis. For token assets, convert the UI amount using the selected pool's
`decimals` value.

***

### collateralAsset

> **collateralAsset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L75)

Asset the user will deposit as collateral.

Must match the asset for `collateralPoolId`; for example, use `"BTC"` with
a BTC collateral pool.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:61](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L61)

Principal text of the pool that receives the user's collateral deposit.

This should be the `id` of the collateral `Pool` selected from
`client.market.listPools()`. The pool asset must match `collateralAsset`.

***

### depositWindowSeconds

> **depositWindowSeconds**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:114](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L114)

Seconds allowed for the user to send collateral after loan creation.

If the collateral deposit is not detected before this window expires, the
instant-loan flow can time out. Internally this is sent to the canister as
`ltv_timer_s`.

***

### ltvMaxBps

> **ltvMaxBps**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:106](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L106)

Maximum allowed loan-to-value ratio in basis points.

`6_000n` means 60%. Use `client.quote.calculateLtv(...)` to calculate the
implied LTV for the selected amounts and pass the policy value your app is
willing to accept. Creation is rejected if the requested borrow would exceed
this limit.

***

### refundDestination

> **refundDestination**: `string` \| [`ExternalAccount`](ExternalAccount.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:130](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L130)

External destination that receives collateral refunds or withdrawals.

Pass either an address string or `{ type: "External", address }`. This
should be an address on the collateral asset's chain, such as a BTC address
when `collateralAsset` is `"BTC"`.
