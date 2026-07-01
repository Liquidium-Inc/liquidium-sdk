[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ExternalAccount

# Interface: ExternalAccount

Defined in: [packages/client/src/modules/instant-loans/types.ts:12](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L12)

External chain account used for borrow delivery or collateral refunds.

## Properties

### address

> **address**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:33](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L33)

Destination address on the external chain.

For `borrowDestination`, this receives the borrowed asset. For
`refundDestination`, this receives collateral refunds or withdrawals.

***

### chain?

> `optional` **chain?**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:26](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L26)

Optional chain metadata for display and caller-side validation.

The instant-loan API only sends `address` to the canister. Include `chain`
when your UI needs to remember which network the address belongs to.

***

### type

> **type**: `"External"`

Defined in: [packages/client/src/modules/instant-loans/types.ts:19](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L19)

Account kind discriminator.

Use `External` for addresses outside the IC, such as BTC, Solana, or EVM
addresses. Instant-loan creation currently accepts external destinations.
