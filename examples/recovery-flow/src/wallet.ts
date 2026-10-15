import "viem/window";
import {
  encodeIcrcAccount,
  type IcrcAccount,
} from "@icp-sdk/canisters/ledger/icrc";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Signer } from "@icp-sdk/signer";
import { SignerAgent } from "@icp-sdk/signer/agent";
import { PostMessageTransport } from "@icp-sdk/signer/web";
import type { IcpRecoveryAuthorization } from "@liquidium/client";
import { createWalletClient, custom } from "viem";

const OISY_SIGNER_URL = "https://oisy.com/sign";
const IC_HOST = "https://icp-api.io";

export interface OisyConnection {
  signer: Signer;
  accounts: IcrcAccount[];
}

export type EthereumConnection = Awaited<ReturnType<typeof connectEthereum>>;

export async function connectOisy(): Promise<OisyConnection> {
  const signer = new Signer({
    transport: new PostMessageTransport({ url: OISY_SIGNER_URL }),
  });
  return withSignerChannel(signer, async () => {
    const standards = await signer.getSupportedStandards();
    for (const required of ["ICRC-27", "ICRC-49"]) {
      if (!standards.some(({ name }) => name === required))
        throw new Error(`Wallet does not support ${required}.`);
    }
    const accounts = await signer.getAccounts();
    if (accounts.length === 0)
      throw new Error(
        "No accounts shared. Connect again and select an account."
      );
    return { signer, accounts };
  });
}

export async function withOisyAuthorization<T>(
  connection: OisyConnection,
  account: IcrcAccount,
  operation: (authorization: IcpRecoveryAuthorization) => Promise<T>
): Promise<T> {
  return withSignerChannel(connection.signer, async () => {
    const offered = await connection.signer.getAccounts();
    if (
      !offered.some(
        (candidate) =>
          encodeIcrcAccount(candidate) === encodeIcrcAccount(account)
      )
    ) {
      throw new Error(
        "The selected OISY account is no longer available. Connect again."
      );
    }
    const agent = SignerAgent.createSync({
      signer: connection.signer,
      account: account.owner,
      agent: HttpAgent.createSync({ host: IC_HOST }),
    });
    return operation({
      type: "icp_caller",
      agent,
      subaccount: account.subaccount,
    });
  });
}

export async function connectEthereum() {
  if (!window.ethereum)
    throw new Error(
      "Install or enable an Ethereum browser wallet, then reload this page."
    );
  const wallet = createWalletClient({ transport: custom(window.ethereum) });
  const [address] = await wallet.requestAddresses();
  if (!address) throw new Error("No Ethereum account selected.");
  return { wallet, address };
}

export async function signEthereumMessage(
  connection: EthereumConnection,
  message: string
): Promise<string> {
  const [currentAddress] = await connection.wallet.getAddresses();
  if (currentAddress?.toLowerCase() !== connection.address.toLowerCase()) {
    throw new Error("Ethereum account changed. Connect again before signing.");
  }
  return connection.wallet.signMessage({
    account: connection.address,
    message,
  });
}

export async function withSignerChannel<T>(
  signer: Signer,
  operation: () => Promise<T>
): Promise<T> {
  signer.autoCloseTransportChannel = false;
  // Open before the first await so the popup retains the user's click.
  const channel = signer.openChannel();
  try {
    await channel;
    return await operation();
  } finally {
    signer.autoCloseTransportChannel = true;
    // Closing a popup must not replace a successful transfer receipt.
    await signer.closeChannel().catch(() => undefined);
  }
}
