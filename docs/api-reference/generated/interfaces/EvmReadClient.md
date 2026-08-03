[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmReadClient

# Interface: EvmReadClient

Defined in: [packages/client/src/core/types.ts:11](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L11)

Minimal viem-compatible client shape required for SDK EVM read calls.

When `getCode` is present and `chain` identifies Ethereum mainnet, the SDK
uses it for a best-effort native ETH contract-destination check. Provider
failures fail open and do not block the outflow.

## Properties

### chain?

> `optional` **chain?**: `Chain`

Defined in: [packages/client/src/core/types.ts:13](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L13)

***

### getCode?

> `optional` **getCode?**: (`args`) => `Promise`\<`GetCodeReturnType`\>

Defined in: [packages/client/src/core/types.ts:14](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L14)

#### Parameters

##### args

`GetCodeParameters`

#### Returns

`Promise`\<`GetCodeReturnType`\>

***

### readContract

> **readContract**: \<`abi`, `functionName`, `args`\>(`args`) => `Promise`\<`ReadContractReturnType`\<`abi`, `functionName`, `args`\>\>

Defined in: [packages/client/src/core/types.ts:12](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L12)

#### Type Parameters

##### abi

`abi` *extends* `Abi` \| readonly `unknown`[]

##### functionName

`functionName` *extends* `string`

##### args

`args` *extends* `unknown`

#### Parameters

##### args

`ReadContractParameters`\<`abi`, `functionName`, `args`\>

#### Returns

`Promise`\<`ReadContractReturnType`\<`abi`, `functionName`, `args`\>\>
