[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanAccount

# Type Alias: SimpleLoanAccount

> **SimpleLoanAccount** = [`LiquidiumAccount`](LiquidiumAccount.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:116](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L116)

Borrow destination or refund account associated with a simple loan.

## Example

```ts
const icPrincipalAccount: SimpleLoanAccount = {
  type: "IcPrincipal",
  address: "aaaaa-aa",
};

const chainAddressAccount: SimpleLoanAccount = {
  type: "ChainAddress",
  address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
};

const accountIdentifierAccount: SimpleLoanAccount = {
  type: "IcpAccountIdentifier",
  address: "e2134f3f176b1429df3f92807b8f0f26a520debc313b2d6ad86a4a2e7f3d8f8d",
};

const icrcAccount: SimpleLoanAccount = {
  type: "IcrcAccount",
  owner: "aaaaa-aa",
  address: "aaaaa-aa",
};
```
