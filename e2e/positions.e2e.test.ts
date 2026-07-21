import { expect, test } from "vitest";
import { LiquidiumClient } from "../packages/client/src";
import { describeLive } from "./_internal/live";

const DUST_PROFILE_ID = process.env.LIQUIDIUM_E2E_DUST_PROFILE_ID ?? "";
const DUST_POOL_ID = process.env.LIQUIDIUM_E2E_DUST_POOL_ID ?? "";
const HAS_DUST_POSITION_FIXTURE = DUST_PROFILE_ID !== "" && DUST_POOL_ID !== "";

describeLive("live positions e2e", () => {
  test.skipIf(!HAS_DUST_POSITION_FIXTURE)(
    "should omit a supplied-only position below its pool dust threshold",
    async () => {
      // given
      const client = new LiquidiumClient();
      const pools = await client.market.listPools();
      const dustPool = pools.find((pool) => pool.id === DUST_POOL_ID);
      const rawPosition = await client.positions.getPosition(
        DUST_PROFILE_ID,
        DUST_POOL_ID
      );
      if (!dustPool) {
        throw new Error(`Dust fixture pool ${DUST_POOL_ID} was not found`);
      }
      if (!rawPosition) {
        throw new Error("Dust fixture position was not found");
      }

      // when
      const visiblePositions =
        await client.positions.listPositions(DUST_PROFILE_ID);

      // then
      expect(rawPosition.borrowed).toBe(0n);
      expect(rawPosition.debtInterest).toBe(0n);
      expect(rawPosition.deposited).toBeLessThan(
        dustPool.sameAssetBorrowingDustThreshold
      );
      expect(
        visiblePositions.some((position) => position.poolId === DUST_POOL_ID)
      ).toBe(false);
    }
  );
});
