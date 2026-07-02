[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ExternalAccount

# Interface: ExternalAccount

Defined in: [packages/client/src/modules/instant-loans/types.ts:9](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L9)

External chain account used for borrow delivery or collateral refunds.

## Properties

### address

> **address**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:30](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L30)

Destination address on the external chain.

For `borrowDestination`, this receives the borrowed asset. For
`refundDestination`, this receives collateral refunds or withdrawals.

***

### chain?

> `optional` **chain?**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:23](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L23)

Optional chain metadata for display and caller-side validation.

The instant-loan API only sends `address` to the canister. Include `chain`
when your UI needs to remember which network the address belongs to.

***

### type

> **type**: `"External"`

Defined in: [packages/client/src/modules/instant-loans/types.ts:16](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L16)

Account kind discriminator.

Use `External` for addresses outside the IC, such as BTC, Solana, or EVM
addresses. Instant-loan creation currently accepts external destinations.
