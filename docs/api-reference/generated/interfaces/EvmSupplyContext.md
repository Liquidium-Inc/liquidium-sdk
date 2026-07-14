[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmSupplyContext

# Interface: EvmSupplyContext

Defined in: [packages/client/src/modules/lending/types.ts:336](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L336)

ERC-20 supply planning data returned by `lending.getEvmSupplyContext(...)`.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:344](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L344)

Deposit or repayment action for the inflow.

***

### allowance

> **allowance**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:360](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L360)

Current allowance serialized in base units.

***

### amount

> **amount**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:350](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L350)

Requested amount serialized in token base units.

***

### approvalStrategy

> **approvalStrategy**: [`EvmSupplyApprovalStrategy`](../type-aliases/EvmSupplyApprovalStrategy.md)

Defined in: [packages/client/src/modules/lending/types.ts:364](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L364)

Approval sequence the caller should perform.

***

### asset

> **asset**: `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/lending/types.ts:346](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L346)

Supported ETH stablecoin asset.

***

### balance

> **balance**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:358](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L358)

Current token balance serialized in base units.

***

### chain

> **chain**: `"ETH"`

Defined in: [packages/client/src/modules/lending/types.ts:348](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L348)

ETH chain discriminator.

***

### depositContractAddress

> **depositContractAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:356](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L356)

Deposit helper contract address.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:340](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L340)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:338](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L338)

Liquidium profile principal text.

***

### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [packages/client/src/modules/lending/types.ts:362](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L362)

Whether an approval transaction is needed before deposit.

***

### spenderAddress

> **spenderAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:354](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L354)

Contract address that must be approved as spender.

***

### tokenAddress

> **tokenAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:352](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L352)

ERC-20 token contract address.

***

### walletAddress

> **walletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:342](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L342)

Normalized EVM wallet address.
