[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ExternalAccount

# Interface: ExternalAccount

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:8](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L8)

External chain account used for borrow delivery or collateral refunds.

## Properties

### address

> **address**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:29](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L29)

Destination address on the external chain.

For `borrowDestination`, this receives the borrowed asset. For
`refundDestination`, this receives collateral refunds or withdrawals.

***

### chain?

> `optional` **chain?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:22](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L22)

Optional chain metadata for display and caller-side validation.

The instant-loan API only sends `address` to the canister. Include `chain`
when your UI needs to remember which network the address belongs to.

***

### type

> **type**: `"External"`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/types.ts:15](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/types.ts#L15)

Account kind discriminator.

Use `External` for addresses outside the IC, such as BTC, Solana, or EVM
addresses. Instant-loan creation currently accepts external destinations.
