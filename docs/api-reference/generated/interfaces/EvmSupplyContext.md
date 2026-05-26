[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmSupplyContext

# Interface: EvmSupplyContext

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:318](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L318)

ERC-20 supply planning data returned by `lending.getEvmSupplyContext(...)`.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:328](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L328)

Deposit or repayment action for the inflow.

***

### allowance

> **allowance**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:344](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L344)

Current allowance serialized in base units.

***

### amount

> **amount**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:334](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L334)

Requested amount serialized in token base units.

***

### approvalStrategy

> **approvalStrategy**: [`EvmSupplyApprovalStrategy`](../type-aliases/EvmSupplyApprovalStrategy.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:348](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L348)

Approval sequence the caller should perform.

***

### asset

> **asset**: `"USDC"` \| `"USDT"`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:330](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L330)

Supported ETH stablecoin asset.

***

### balance

> **balance**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:342](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L342)

Current token balance serialized in base units.

***

### chain

> **chain**: `"ETH"`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:332](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L332)

ETH chain discriminator.

***

### depositContractAddress

> **depositContractAddress**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:340](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L340)

Deposit helper contract address.

***

### poolId

> **poolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:324](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L324)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:322](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L322)

Liquidium profile principal text.

***

### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:346](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L346)

Whether an approval transaction is needed before deposit.

***

### spenderAddress

> **spenderAddress**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:338](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L338)

Contract address that must be approved as spender.

***

### success

> **success**: `true`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:320](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L320)

Indicates the context was computed successfully.

***

### tokenAddress

> **tokenAddress**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:336](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L336)

ERC-20 token contract address.

***

### walletAddress

> **walletAddress**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:326](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L326)

Normalized EVM wallet address.
