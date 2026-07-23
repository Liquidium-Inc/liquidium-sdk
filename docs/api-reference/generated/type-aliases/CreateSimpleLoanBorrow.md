[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateSimpleLoanBorrow

# Type Alias: CreateSimpleLoanBorrow

> **CreateSimpleLoanBorrow** = [`AssetIdentifier`](AssetIdentifier.md) & `object`

Defined in: [packages/client/src/modules/simple-loans/types.ts:47](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L47)

Borrow leg used when creating a simple loan.

`chain` and `asset` form the canonical asset identifier. For example,
`{ chain: "ICP", asset: "USDT" }` means ckUSDT.

## Type Declaration

### amount

> **amount**: `bigint`

Amount to borrow, in the borrow asset's base units.

ETH and ckETH use 18-decimal wei base units; do not pass human-readable ETH
values directly. For USDC/USDT, convert the UI amount using the selected
borrow pool's `decimals` value before passing it here.

### destination

> **destination**: [`SimpleLoanDestination`](SimpleLoanDestination.md)

Destination that receives the borrowed asset after the loan starts.

Pass either a string shorthand or a typed destination. For BTC/ETH chain
outflows this is usually the user's chain address. Chain-key assets on ICP
require an `IcPrincipal`; native ICP also accepts `IcpAccountIdentifier`
and `IcrcAccount` destinations.

### poolId

> **poolId**: `string`

Principal text of the pool that funds the borrow.

This should be the `id` of the borrow `Pool` selected from
`client.market.listPools()`. The pool asset must match `asset`.
