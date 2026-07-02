[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanAccount

# Type Alias: InstantLoanAccount

> **InstantLoanAccount** = [`ExternalAccount`](../interfaces/ExternalAccount.md) \| [`IcPrincipalAccount`](../interfaces/IcPrincipalAccount.md) \| [`AccountIdentifierAccount`](../interfaces/AccountIdentifierAccount.md) \| [`IcrcAccount`](../interfaces/IcrcAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L79)

Borrow destination or refund account associated with an instant loan.

## Example

```ts
const icPrincipalAccount: InstantLoanAccount = {
  type: "IcPrincipal",
  principal: "aaaaa-aa",
};

const externalAccount: InstantLoanAccount = {
  type: "External",
  address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
};

const accountIdentifierAccount: InstantLoanAccount = {
  type: "AccountIdentifier",
  address: "e2134f3f176b1429df3f92807b8f0f26a520debc313b2d6ad86a4a2e7f3d8f8d",
};

const icrcAccount: InstantLoanAccount = {
  type: "Icrc",
  owner: "aaaaa-aa",
  address: "aaaaa-aa",
};
```
