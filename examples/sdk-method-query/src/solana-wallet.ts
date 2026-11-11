import type { WalletAdapter } from "@liquidium/client";
import {
  type BlockhashWithExpiryBlockHeight,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const SOL_SIGNATURE_BYTES = 64;
const HEX_RADIX = 16;
const HEX_CHARACTERS_PER_BYTE = 2;
const MAX_SOL_AMOUNT_LAMPORTS = 2n ** 64n - 1n;

const SOLANA_MAINNET_GENESIS_HASH =
  "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";

interface SolanaRpcConnection {
  getGenesisHash(): Promise<string>;
  getLatestBlockhash(): Promise<BlockhashWithExpiryBlockHeight>;
}

interface SolanaTransactionSignature {
  signature: string;
}

interface SolanaTransactionSigner {
  signAndSendTransaction(
    transaction: Transaction
  ): Promise<SolanaTransactionSignature>;
}

export interface ConnectedSolanaWallet {
  address: string;
  signMessage(message: string): Promise<string | undefined>;
  getConnection(): Promise<SolanaRpcConnection>;
  getSigner(): Promise<SolanaTransactionSigner>;
}

export function createSolanaWalletAdapter(
  wallet: ConnectedSolanaWallet
): WalletAdapter {
  return {
    signMessage: async ({ chain, account, message }) => {
      assertSolanaAccount(wallet, chain, account);
      // Dynamic returns SOL message signatures as base64; the SDK requires hex.
      const signature = await wallet.signMessage(message);

      if (!signature) {
        throw new Error("Wallet returned no signature.");
      }

      const signatureBytes = Uint8Array.from(atob(signature), (character) =>
        character.charCodeAt(0)
      );

      if (signatureBytes.length !== SOL_SIGNATURE_BYTES) {
        throw new Error("Wallet must return a 64-byte SOL signature.");
      }

      return Array.from(signatureBytes, (byte) =>
        byte.toString(HEX_RADIX).padStart(HEX_CHARACTERS_PER_BYTE, "0")
      ).join("");
    },
    sendSolTransaction: async ({
      chain,
      account,
      toAddress,
      amountLamports,
    }) => {
      assertSolanaAccount(wallet, chain, account);

      if (amountLamports <= 0n || amountLamports > MAX_SOL_AMOUNT_LAMPORTS) {
        throw new Error("SOL amount must be positive and fit in uint64.");
      }

      const connection = await wallet.getConnection();

      if ((await connection.getGenesisHash()) !== SOLANA_MAINNET_GENESIS_HASH) {
        throw new Error("Switch the Solana wallet to mainnet before sending.");
      }

      const sender = new PublicKey(wallet.address);
      const blockhash = await connection.getLatestBlockhash();
      const transaction = new Transaction({ ...blockhash, feePayer: sender });
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: new PublicKey(toAddress),
          lamports: amountLamports,
        })
      );
      const signer = await wallet.getSigner();
      const { signature } = await signer.signAndSendTransaction(transaction);

      if (!signature) {
        throw new Error("Wallet returned no transaction signature.");
      }

      return signature;
    },
  };
}

function assertSolanaAccount(
  wallet: ConnectedSolanaWallet,
  chain: string,
  account: string | undefined
): void {
  if (chain !== "SOL") {
    throw new Error("The connected Solana wallet can only sign SOL requests.");
  }

  if (account && account !== wallet.address) {
    throw new Error("The request account does not match the connected wallet.");
  }
}
