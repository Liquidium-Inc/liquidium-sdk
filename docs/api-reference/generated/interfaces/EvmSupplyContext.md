[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EvmSupplyContext

# Interface: EvmSupplyContext

Defined in: packages/client/src/modules/lending/types.ts:430

ERC-20 supply planning data returned by `lending.getEvmSupplyContext(...)`.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: packages/client/src/modules/lending/types.ts:438

Deposit or repayment action for the inflow.

***

### allowance

> **allowance**: `string`

Defined in: packages/client/src/modules/lending/types.ts:454

Current allowance serialized in base units.

***

### amount

> **amount**: `string`

Defined in: packages/client/src/modules/lending/types.ts:444

Requested amount serialized in token base units.

***

### approvalStrategy

> **approvalStrategy**: [`EvmSupplyApprovalStrategy`](../type-aliases/EvmSupplyApprovalStrategy.md)

Defined in: packages/client/src/modules/lending/types.ts:458

Approval sequence the caller should perform.

***

### asset

> **asset**: `"USDC"` \| `"USDT"`

Defined in: packages/client/src/modules/lending/types.ts:440

Supported ETH stablecoin asset.

***

### balance

> **balance**: `string`

Defined in: packages/client/src/modules/lending/types.ts:452

Current token balance serialized in base units.

***

### chain

> **chain**: `"ETH"`

Defined in: packages/client/src/modules/lending/types.ts:442

ETH chain discriminator.

***

### depositContractAddress

> **depositContractAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:450

Deposit helper contract address.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:434

Pool principal text receiving the inflow.

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:432

Liquidium profile principal text.

***

### requiresApproval

> **requiresApproval**: `boolean`

Defined in: packages/client/src/modules/lending/types.ts:456

Whether an approval transaction is needed before deposit.

***

### spenderAddress

> **spenderAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:448

Contract address that must be approved as spender.

***

### tokenAddress

> **tokenAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:446

ERC-20 token contract address.

***

### walletAddress

> **walletAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:436

Normalized EVM wallet address.
