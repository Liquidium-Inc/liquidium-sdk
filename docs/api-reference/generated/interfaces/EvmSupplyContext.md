[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmSupplyContext

# Interface: EvmSupplyContext

Defined in: [packages/client/src/modules/lending/types.ts:407](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L407)

ERC-20 supply planning data returned by `lending.getEvmSupplyContext(...)`.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:417](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L417)

Deposit or repayment action for the inflow.

***

### allowance

> **allowance**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:433](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L433)

Current allowance serialized in base units.

***

### amount

> **amount**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:423](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L423)

Requested amount serialized in token base units.

***

### approvalStrategy

> **approvalStrategy**: [`EvmSupplyApprovalStrategy`](../type-aliases/EvmSupplyApprovalStrategy.md)

Defined in: [packages/client/src/modules/lending/types.ts:437](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L437)

Approval sequence the caller should perform.

***

### asset

> **asset**: `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/lending/types.ts:419](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L419)

Supported ETH stablecoin asset.

***

### balance

> **balance**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:431](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L431)

Current token balance serialized in base units.

***

### chain

> **chain**: `"ETH"`

Defined in: [packages/client/src/modules/lending/types.ts:421](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L421)

ETH chain discriminator.

***

### depositContractAddress

> **depositContractAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:429](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L429)

Deposit helper contract address.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:413](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L413)

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:411](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L411)

Liquidium profile principal text.

***

### requiresApproval

> **requiresApproval**: `boolean`

Defined in: [packages/client/src/modules/lending/types.ts:435](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L435)

Whether an approval transaction is needed before deposit.

***

### spenderAddress

> **spenderAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:427](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L427)

Contract address that must be approved as spender.

***

### success

> **success**: `true`

Defined in: [packages/client/src/modules/lending/types.ts:409](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L409)

Indicates the context was computed successfully.

***

### tokenAddress

> **tokenAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:425](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L425)

ERC-20 token contract address.

***

### walletAddress

> **walletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:415](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L415)

Normalized EVM wallet address.
