[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CkLedgerFamilyCanisterIds

# Interface: CkLedgerFamilyCanisterIds

Defined in: [packages/client/src/core/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L73)

Ledger, index, minter, and archive canisters for one ledger family.

## Properties

### archive?

> `optional` **archive?**: `string`

Defined in: [packages/client/src/core/types.ts:81](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L81)

Ledger archive canister principal, when available.

***

### index?

> `optional` **index?**: `string`

Defined in: [packages/client/src/core/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L77)

Ledger index canister principal, when available.

***

### ledger

> **ledger**: `string`

Defined in: [packages/client/src/core/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L75)

ICRC or ICP ledger canister principal.

***

### minter?

> `optional` **minter?**: `string`

Defined in: [packages/client/src/core/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L79)

Chain-key minter canister principal, when available.
