[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmSupplyContext

# Interface: EvmSupplyContext

Defined in: [packages/client/src/modules/lending/types.ts:382](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L382)

ERC-20 supply planning data returned by `lending.getEvmSupplyContext(...)`.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:392](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L392)

Deposit or repayment action for the inflow.

***

### allowance

> **allowance**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:408](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L408)

Current allowance serialized in base units.

***

### amount

> **amount**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:398](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L398)

Requested amount serialized in token base units.

***

### approvalStrategy

> **approvalStrategy**: [`EvmSupplyApprovalStrategy`](../type-aliases/EvmSupplyApprovalStrategy.md)

Defined in: [packages/client/src/modules/lending/types.ts:412](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L412)

Approval sequence the caller should perform.

***

### asset

> **asset**: `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/lending/types.ts:394](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L394)

Supported ETH stablecoin asset.

***

### balance

> **balance**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:406](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L406)

Current token balance serialized in base units.

***

### chain

> **chain**: `"ETH"`

Defined in: [packages/client/src/modules/lending/types.ts:396](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L396)

ETH chain discriminator.

***

### depositContractAddress

> **depositContractAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:404](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L404)

Deposit helper contract address.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:388](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L388)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:386](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L386)

Liquidium profile principal text.

***

### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [packages/client/src/modules/lending/types.ts:410](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L410)

Whether an approval transaction is needed before deposit.

***

### spenderAddress

> **spenderAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:402](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L402)

Contract address that must be approved as spender.

***

### success

> **success**: `true`

Defined in: [packages/client/src/modules/lending/types.ts:384](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L384)

Indicates the context was computed successfully.

***

### tokenAddress

> **tokenAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:400](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L400)

ERC-20 token contract address.

***

### walletAddress

> **walletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:390](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L390)

Normalized EVM wallet address.
