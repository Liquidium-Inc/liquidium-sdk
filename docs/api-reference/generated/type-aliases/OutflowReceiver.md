[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowReceiver

# Type Alias: OutflowReceiver

> **OutflowReceiver** = [`ChainAddressOutflowReceiver`](../interfaces/ChainAddressOutflowReceiver.md) \| [`IcPrincipalOutflowReceiver`](../interfaces/IcPrincipalOutflowReceiver.md) \| [`IcpAccountIdentifierOutflowReceiver`](../interfaces/IcpAccountIdentifierOutflowReceiver.md) \| [`IcrcAccountOutflowReceiver`](../interfaces/IcrcAccountOutflowReceiver.md)

Defined in: [packages/client/src/modules/lending/types.ts:96](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L96)

Destination account for a completed outflow.

## Example

```ts
const icPrincipalReceiver: OutflowReceiver = {
  type: "IcPrincipal",
  principal: "aaaaa-aa",
};

const chainAddressReceiver: OutflowReceiver = {
  type: "ChainAddress",
  address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
};

const icpAccountIdentifierReceiver: OutflowReceiver = {
  type: "IcpAccountIdentifier",
  accountIdentifier: "e2134f3f176b1429df3f92807b8f0f26a520debc313b2d6ad86a4a2e7f3d8f8d",
};

const icrcAccountReceiver: OutflowReceiver = {
  type: "IcrcAccount",
  owner: "aaaaa-aa",
  address: "aaaaa-aa",
};
```
