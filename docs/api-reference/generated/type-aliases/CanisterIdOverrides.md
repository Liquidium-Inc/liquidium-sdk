[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CanisterIdOverrides

# Type Alias: CanisterIdOverrides

> **CanisterIdOverrides** = `Omit`\<`Partial`\<[`CanisterIds`](../interfaces/CanisterIds.md)\>, `"pools"`\> & `object`

Defined in: [packages/client/src/core/types.ts:67](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L67)

Custom canister principal overrides accepted by client configuration.

## Type Declaration

### pools?

> `optional` **pools?**: `Partial`\<[`PoolCanisterIds`](../interfaces/PoolCanisterIds.md)\>

Partial grouped pool canister principal overrides.
