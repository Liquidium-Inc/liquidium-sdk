import type { AssetPrices, Pool } from "@liquidium/client";
import type { Dispatch, SetStateAction } from "react";

export type SharedExampleState = {
  profileId: string | null;
  setProfileId: Dispatch<SetStateAction<string | null>>;
  pools: Pool[];
  setPools: Dispatch<SetStateAction<Pool[]>>;
  prices: AssetPrices;
  setPrices: Dispatch<SetStateAction<AssetPrices>>;
};
