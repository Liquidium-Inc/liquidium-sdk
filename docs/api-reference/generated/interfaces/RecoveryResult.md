[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / RecoveryResult

# Interface: RecoveryResult

Defined in: packages/client/src/modules/lending/types.ts:187

Receipt for the recovery transfer. For the ICP pool, this transfer is the
destination delivery. Other pools deliver later from an outflow subaccount.

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:189

Amount removed from the recovery balance, before withdrawal fees.

***

### blockIndex

> **blockIndex**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:193

Recovery transfer block index, not an activities API outflow id.

***

### ledgerCanisterId

> **ledgerCanisterId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:191

Ledger containing the recovery transfer.

***

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: packages/client/src/modules/lending/types.ts:195

Withdrawal processing status. Final delivery must be tracked separately.
