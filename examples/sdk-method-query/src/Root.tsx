import type { AssetPrices, Pool } from "@liquidium/client";
import { useState } from "react";
import { SdkMethodQueryPage } from "./SdkMethodQueryPage";

export default function Root() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [prices, setPrices] = useState<AssetPrices>({});

  const sharedExampleState = {
    profileId,
    setProfileId,
    pools,
    setPools,
    prices,
    setPrices,
  };

  return (
    <div>
      <header className="example-nav">
        <span className="is-active">SDK Method Query</span>
      </header>

      <SdkMethodQueryPage {...sharedExampleState} />
    </div>
  );
}
