[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateSimpleLoanRequest

# Interface: CreateSimpleLoanRequest

Defined in: [packages/client/src/modules/simple-loans/types.ts:132](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L132)

Parameters for creating an accountless simple loan.

Use market data from `client.market.listPools()` to choose the two pool ids,
and use `client.quote.calculateLtv(...)` before creation to validate the
amount pair and choose `ltvMaxBps`.

Amount fields are in each asset's smallest/base units. For example, BTC uses
satoshis and ERC-20 assets use token base units according to the selected
pool decimals.

## Properties

### borrow

> **borrow**: [`CreateSimpleLoanBorrow`](../type-aliases/CreateSimpleLoanBorrow.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:136](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L136)

Borrow leg: pool, asset, amount, delivery chain, and destination.

***

### collateral

> **collateral**: [`CreateSimpleLoanCollateral`](CreateSimpleLoanCollateral.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:134](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L134)

Collateral leg: pool, asset, and amount the user deposits.

***

### depositWindowSeconds

> **depositWindowSeconds**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:155](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L155)

Seconds allowed for the user to send collateral after loan creation.

If the collateral deposit is not detected before this window expires, the
simple loan flow can time out. Internally this is sent to the canister as
`ltv_timer_s`.

***

### ltvMaxBps

> **ltvMaxBps**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:147](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L147)

Maximum allowed loan-to-value ratio in basis points.

`6_000n` means 60%. Use `client.quote.calculateLtv(...)` to calculate the
implied LTV for the selected amounts and pass the policy value your app is
willing to accept. Creation is rejected if the requested borrow would exceed
this limit.

***

### refund

> **refund**: [`CreateSimpleLoanRefund`](CreateSimpleLoanRefund.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L138)

Refund leg: chain and destination for returned collateral.
