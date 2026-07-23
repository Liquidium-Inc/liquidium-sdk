[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmSupplyContext

# Interface: EvmSupplyContext

Defined in: [packages/client/src/modules/lending/types.ts:339](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L339)

ERC-20 supply planning data returned by `lending.getEvmSupplyContext(...)`.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:347](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L347)

Deposit or repayment action for the inflow.

***

### allowance

> **allowance**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:363](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L363)

Current allowance serialized in base units.

***

### amount

> **amount**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:353](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L353)

Requested amount serialized in token base units.

***

### approvalStrategy

> **approvalStrategy**: [`EvmSupplyApprovalStrategy`](../type-aliases/EvmSupplyApprovalStrategy.md)

Defined in: [packages/client/src/modules/lending/types.ts:367](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L367)

Approval sequence the caller should perform.

***

### asset

> **asset**: `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/lending/types.ts:349](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L349)

Supported ETH stablecoin asset.

***

### balance

> **balance**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:361](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L361)

Current token balance serialized in base units.

***

### chain

> **chain**: `"ETH"`

Defined in: [packages/client/src/modules/lending/types.ts:351](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L351)

ETH chain discriminator.

***

### depositContractAddress

> **depositContractAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:359](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L359)

Deposit helper contract address.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:343](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L343)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:341](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L341)

Liquidium profile principal text.

***

### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [packages/client/src/modules/lending/types.ts:365](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L365)

Whether an approval transaction is needed before deposit.

***

### spenderAddress

> **spenderAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:357](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L357)

Contract address that must be approved as spender.

***

### tokenAddress

> **tokenAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:355](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L355)

ERC-20 token contract address.

***

### walletAddress

> **walletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:345](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L345)

Normalized EVM wallet address.
