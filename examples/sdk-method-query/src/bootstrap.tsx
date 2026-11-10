import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import React from "react";
import type { Root } from "react-dom/client";
import RootPage from "./Root";

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
          walletConnectors: [EthereumWalletConnectors, SolanaWalletConnectors],
        }}
      >
        <RootPage />
      </DynamicContextProvider>
    </React.StrictMode>
  );
}
