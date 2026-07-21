import { expect, test } from "vitest";
import { LiquidiumClient } from "../packages/client/src";
import { describeLive } from "./_internal/live";

const DUST_PROFILE_ID = process.env.LIQUIDIUM_E2E_DUST_PROFILE_ID ?? "";
const HAS_DUST_POSITION_FIXTURE = DUST_PROFILE_ID !== "";

describeLive("live positions e2e", () => {
  test.skipIf(!HAS_DUST_POSITION_FIXTURE)(
    "should hide dust supply without removing the debt position",
    async () => {
      // given
      const client = new LiquidiumClient();
      const pools = await client.market.listPools();
      const positionsByPool = await Promise.all(
        pools.map(async (pool) => ({
          pool,
          position: await client.positions.getPosition(
            DUST_PROFILE_ID,
            pool.id
          ),
        }))
      );
      const dustFixture = positionsByPool.find(
        ({ pool, position }) =>
          position !== null &&
          position.deposited > 0n &&
          position.borrowed + position.debtInterest > 0n &&
          position.deposited < pool.sameAssetBorrowingDustThreshold
      );
      if (!dustFixture) {
        const positionSummary = positionsByPool
          .filter(({ position }) => position !== null)
          .map(({ pool, position }) => ({
            asset: pool.asset,
            poolId: pool.id,
            deposited: position?.deposited.toString(),
            borrowed: position?.borrowed.toString(),
            debtInterest: position?.debtInterest.toString(),
            dustThreshold: pool.sameAssetBorrowingDustThreshold.toString(),
          }));
        throw new Error(
          `Profile has no dust supply with debt: ${JSON.stringify(positionSummary)}`
        );
      }

      // when
      const visiblePositions =
        await client.positions.listPositions(DUST_PROFILE_ID);
      const visibleDustPosition = visiblePositions.find(
        (position) => position.poolId === dustFixture.pool.id
      );

      // then
      expect(dustFixture.position?.deposited).toBeLessThan(
        dustFixture.pool.sameAssetBorrowingDustThreshold
      );
      expect(visibleDustPosition?.deposited).toBe(0n);
      expect(visibleDustPosition?.earnedInterest).toBe(0n);
      expect(visibleDustPosition?.borrowed).toBeGreaterThanOrEqual(
        dustFixture.position?.borrowed ?? 0n
      );
      expect(visibleDustPosition?.debtInterest).toBeGreaterThanOrEqual(
        dustFixture.position?.debtInterest ?? 0n
      );
    }
  );
});
