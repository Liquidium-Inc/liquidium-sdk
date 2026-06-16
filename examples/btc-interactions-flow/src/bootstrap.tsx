import { BitcoinWalletConnectors } from "@dynamic-labs/bitcoin";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import React from "react";
import type { Root } from "react-dom/client";
import { App } from "./App";

type MountAppParams = {
  root: Root;
  dynamicEnvironmentId: string;
};

export function mountApp({ root, dynamicEnvironmentId }: MountAppParams) {
  root.render(
    <React.StrictMode>
      <DynamicContextProvider
        settings={{
          environmentId: dynamicEnvironmentId,
          initialAuthenticationMode: "connect-only",
          walletConnectors: [BitcoinWalletConnectors],
        }}
      >
        <App />
      </DynamicContextProvider>
    </React.StrictMode>
  );
}
