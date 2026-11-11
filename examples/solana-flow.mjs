import { LiquidiumClient } from "../packages/client/dist/index.js";

const [poolId, profileId, apiBaseUrl, lendingCanisterId] =
  process.argv.slice(2);

if (!poolId || !profileId || !apiBaseUrl) {
  throw new Error(
    "Usage: node examples/solana-flow.mjs <poolId> <profileId> <apiBaseUrl> [lendingCanisterId]"
  );
}

const client = new LiquidiumClient({
  apiBaseUrl,
  canisterIds: {
    lending: lendingCanisterId,
    pools: { sol: poolId },
  },
});

for (const chain of ["SOL", "ICP"]) {
  const flow = await client.lending.supply({
    profileId,
    poolId,
    chain,
    action: "deposit",
  });

  const fee = await client.lending.estimateInflowFee({
    ...flow.target,
    profileId,
  });

  console.log(
    JSON.stringify(
      { target: flow.target, fee },
      (_key, value) => (typeof value === "bigint" ? value.toString() : value),
      2
    )
  );
}
