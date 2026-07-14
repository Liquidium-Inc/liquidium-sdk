[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateSimpleLoanRefund

# Interface: CreateSimpleLoanRefund

Defined in: [packages/client/src/modules/simple-loans/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L73)

Refund leg used when creating a simple loan.

## Properties

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L75)

Delivery chain used for collateral refunds and withdrawals. Use ICP for ck-ledger delivery.

***

### destination

> **destination**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:84](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L84)

Destination that receives collateral refunds or withdrawals.

Pass either a string shorthand or a typed destination. For BTC/ETH chain
outflows this is usually the user's chain address. Chain-key assets on ICP
require an `IcPrincipal`; native ICP also accepts `IcpAccountIdentifier`
and `IcrcAccount` destinations.
