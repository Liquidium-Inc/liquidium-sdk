[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidiumAccountReference

# Interface: LiquidiumAccountReference

Defined in: [packages/client/src/core/accounts.ts:63](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/accounts.ts#L63)

Address input with an optional account type hint.

## Properties

### address

> **address**: `string`

Defined in: [packages/client/src/core/accounts.ts:65](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/accounts.ts#L65)

Address, principal, ICRC account, or ICP account identifier.

***

### type

> **type**: [`LiquidiumAccountType`](../type-aliases/LiquidiumAccountType.md)

Defined in: [packages/client/src/core/accounts.ts:67](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/accounts.ts#L67)

Account type hint. Use string shorthand when the SDK should auto-detect.
