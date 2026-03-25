import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import type { ApiClient } from "../internal/api-client";
import type { InternalProvider } from "../internal/provider";
import type { PendingInflow, PendingMovements, PendingOutflow } from "../types";

/**
 * Pending inflows and outflows.
 *
 * Routes through the API when available; canister fallback for v1.
 */
export class PendingModule {
  /** @internal */
  constructor(
    readonly provider: InternalProvider,
    readonly apiClient: ApiClient | undefined
  ) {}

  /**
   * Get all pending movements (inflows + outflows) for a profile.
   */
  async getMovements(profileId: string): Promise<PendingMovements> {
    void profileId;
    void this.provider;
    void this.apiClient;
    // TODO: wire to canister via LendingPool.get_pending_movements
    // or API via GET /v1/pending/users/:profileId
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get pending inflows (deposits and repayments in transit) for a profile.
   */
  async getInflows(profileId: string): Promise<PendingInflow[]> {
    void profileId;
    // TODO: wire to canister via LendingPool.get_pending_inflows
    // or API via GET /v1/pending/users/:profileId/inflows
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get pending outflows (borrows and withdrawals in transit) for a profile.
   */
  async getOutflows(profileId: string): Promise<PendingOutflow[]> {
    void profileId;
    // TODO: wire to canister via LendingPool.get_pending_outflows
    // or API via GET /v1/pending/users/:profileId/outflows
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }
}
