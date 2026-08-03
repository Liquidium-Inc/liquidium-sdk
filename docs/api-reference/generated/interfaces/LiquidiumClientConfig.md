[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidiumClientConfig

# Interface: LiquidiumClientConfig

Defined in: [packages/client/src/core/types.ts:23](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L23)

Runtime options for `new LiquidiumClient(config)`.

Canister-backed reads and SDK HTTP features work with `{}` defaults. Set
`apiBaseUrl` only when overriding the Liquidium production API root.

## Properties

### apiBaseUrl?

> `optional` **apiBaseUrl?**: `string`

Defined in: [packages/client/src/core/types.ts:35](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L35)

Base URL for the Liquidium SDK HTTP API root (e.g. `https://app.example.com/api/sdk`).
Defaults to the Liquidium production API root. Endpoint versions are owned
by this SDK package version.

***

### canisterIds?

> `optional` **canisterIds?**: [`CanisterIdOverrides`](../type-aliases/CanisterIdOverrides.md)

Defined in: [packages/client/src/core/types.ts:39](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L39)

Override individual canister principals for custom deployments.

***

### environment?

> `optional` **environment?**: `"mainnet"`

Defined in: [packages/client/src/core/types.ts:25](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L25)

Preset canister IDs. Only `mainnet` is bundled.

***

### evmPublicClient?

> `optional` **evmPublicClient?**: [`EvmReadClient`](EvmReadClient.md)

Defined in: [packages/client/src/core/types.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L49)

Existing viem client; mainnet `chain` and `getCode` enable native ETH outflow checks.

***

### evmRpcHeaders?

> `optional` **evmRpcHeaders?**: `Record`\<`string`, `string`\>

Defined in: [packages/client/src/core/types.ts:47](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L47)

Optional headers for RPC providers that authenticate via HTTP headers.

***

### evmRpcUrl?

> `optional` **evmRpcUrl?**: `string`

Defined in: [packages/client/src/core/types.ts:45](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L45)

Ethereum RPC URL used for best-effort native ETH outflow checks and public ERC-20 reads.

***

### fetch?

> `optional` **fetch?**: \{(`input`, `init?`): `Promise`\<`Response`\>; (`input`, `init?`): `Promise`\<`Response`\>; \}

Defined in: [packages/client/src/core/types.ts:41](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L41)

Custom `fetch` implementation for SDK API requests.

#### Call Signature

> (`input`, `init?`): `Promise`\<`Response`\>

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`URL` \| `RequestInfo`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>

#### Call Signature

> (`input`, `init?`): `Promise`\<`Response`\>

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`string` \| `URL` \| `Request`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Defined in: [packages/client/src/core/types.ts:37](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L37)

Extra headers sent with every SDK API request.

***

### icHost?

> `optional` **icHost?**: `string`

Defined in: [packages/client/src/core/types.ts:27](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L27)

ICP replica host override (defaults follow `@icp-sdk/core/agent`).

***

### identity?

> `optional` **identity?**: `Identity`

Defined in: [packages/client/src/core/types.ts:29](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L29)

Agent identity for signed canister calls.

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Defined in: [packages/client/src/core/types.ts:43](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/types.ts#L43)

Per-request timeout for SDK API calls in milliseconds.
