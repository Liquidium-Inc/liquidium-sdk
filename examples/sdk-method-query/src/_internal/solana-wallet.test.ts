import type { SignMessageRequest } from "@liquidium/client";
import { SystemInstruction } from "@solana/web3.js";
import { expect, test, vi } from "vitest";
import {
  type ConnectedSolanaWallet,
  createSolanaWalletAdapter,
} from "../solana-wallet";

type SolanaRpcConnection = Awaited<
  ReturnType<ConnectedSolanaWallet["getConnection"]>
>;
type SolanaTransactionSigner = Awaited<
  ReturnType<ConnectedSolanaWallet["getSigner"]>
>;

const WALLET_ADDRESS = "11111111111111111111111111111111";
const RECEIVER_ADDRESS = "So11111111111111111111111111111111111111112";
const SIGNATURE_BYTE = 1;
const SIGNATURE_LENGTH_BYTES = 64;
const MAINNET_GENESIS_HASH = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
const BLOCK_HEIGHT = 100;
const TRANSACTION_SIGNATURE = "test-transaction-signature";
test("passes the SDK message unchanged and converts Dynamic base64 to hex", async () => {
  // given
  const signRequest = createSignRequest();
  const { wallet } = createWallet();
  const adapter = createSolanaWalletAdapter(wallet);

  // when
  const signature = await adapter.signMessage?.(signRequest);

  // then
  const EXPECTED_SIGNATURE_HEX = "01".repeat(SIGNATURE_LENGTH_BYTES);
  expect(wallet.signMessage).toHaveBeenCalledExactlyOnceWith(
    signRequest.message
  );
  expect(signature).toBe(EXPECTED_SIGNATURE_HEX);
});

test.each(["chain", "account"] as const)(
  "rejects a mismatched signing %s before the wallet prompt",
  async (mismatchedField) => {
    // given
    const requestChange: Partial<SignMessageRequest> =
      mismatchedField === "chain"
        ? { chain: "ETH" }
        : { account: RECEIVER_ADDRESS };
    const signRequest = { ...createSignRequest(), ...requestChange };
    const { wallet } = createWallet();
    const adapter = createSolanaWalletAdapter(wallet);

    // when
    const signature = adapter.signMessage?.(signRequest);

    // then
    await expect(signature).rejects.toThrow();
    expect(wallet.signMessage).not.toHaveBeenCalled();
  }
);

test("rejects a short SOL signature", async () => {
  // given
  const signRequest = createSignRequest();
  const shortSignatureBase64 = btoa("short");
  const { wallet } = createWallet();
  wallet.signMessage.mockResolvedValue(
    shortSignatureBase64 satisfies Awaited<
      ReturnType<ConnectedSolanaWallet["signMessage"]>
    >
  );
  const adapter = createSolanaWalletAdapter(wallet);

  // when
  const signature = adapter.signMessage?.(signRequest);

  // then
  await expect(signature).rejects.toThrow("64-byte SOL signature");
});

test.each(["minimum", "above-safe-integer", "maximum"] as const)(
  "builds a native transfer with the exact %s lamport amount",
  async (amountCase) => {
    // given
    const { wallet, signer } = createWallet();
    const minimumAmountLamports = 1n;
    const aboveSafeIntegerAmountLamports = BigInt(Number.MAX_SAFE_INTEGER) + 1n;
    const maximumAmountLamports = 2n ** 64n - 1n;
    const amountsLamports = {
      minimum: minimumAmountLamports,
      "above-safe-integer": aboveSafeIntegerAmountLamports,
      maximum: maximumAmountLamports,
    };
    const amountLamports = amountsLamports[amountCase];
    const adapter = createSolanaWalletAdapter(wallet);

    // when
    const signature = await adapter.sendSolTransaction?.({
      chain: "SOL",
      account: WALLET_ADDRESS,
      toAddress: RECEIVER_ADDRESS,
      amountLamports,
      actionType: "supply-deposit",
    });

    // then
    expect(signature).toBe(TRANSACTION_SIGNATURE);
    expect(signer.signAndSendTransaction).toHaveBeenCalledTimes(1);
    const [transaction] = signer.signAndSendTransaction.mock.calls[0];
    const transfer = SystemInstruction.decodeTransfer(
      transaction.instructions[0]
    );
    expect(transfer.lamports).toBe(amountLamports);
    expect(transfer.fromPubkey.toBase58()).toBe(WALLET_ADDRESS);
    expect(transfer.toPubkey.toBase58()).toBe(RECEIVER_ADDRESS);
  }
);

test("rejects a non-mainnet connection before requesting a transaction signature", async () => {
  // given
  const { wallet, connection, signer } = createWallet();
  const devnetGenesisHash = "devnet-genesis-hash";
  connection.getGenesisHash.mockResolvedValue(
    devnetGenesisHash satisfies Awaited<
      ReturnType<SolanaRpcConnection["getGenesisHash"]>
    >
  );
  const amountLamports = 1n;
  const adapter = createSolanaWalletAdapter(wallet);

  // when
  const signature = adapter.sendSolTransaction?.({
    chain: "SOL",
    toAddress: RECEIVER_ADDRESS,
    amountLamports,
    actionType: "supply-deposit",
  });

  // then
  await expect(signature).rejects.toThrow(
    "Switch the Solana wallet to mainnet"
  );
  expect(signer.signAndSendTransaction).not.toHaveBeenCalled();
});

test.each(["zero", "negative", "overflow"] as const)(
  "rejects %s lamports before RPC or signing",
  async (amountCase) => {
    // given
    const zeroAmountLamports = 0n;
    const negativeAmountLamports = -1n;
    const overflowAmountLamports = 2n ** 64n;
    const amountsLamports = {
      zero: zeroAmountLamports,
      negative: negativeAmountLamports,
      overflow: overflowAmountLamports,
    };
    const amountLamports = amountsLamports[amountCase];
    const { wallet, signer } = createWallet();
    const adapter = createSolanaWalletAdapter(wallet);

    // when
    const signature = adapter.sendSolTransaction?.({
      chain: "SOL",
      toAddress: RECEIVER_ADDRESS,
      amountLamports,
      actionType: "supply-deposit",
    });

    // then
    await expect(signature).rejects.toThrow("positive and fit in uint64");
    expect(wallet.getConnection).not.toHaveBeenCalled();
    expect(signer.signAndSendTransaction).not.toHaveBeenCalled();
  }
);

function createSignRequest(): SignMessageRequest {
  return {
    account: WALLET_ADDRESS,
    chain: "SOL",
    message: "Sign this exact SDK message.",
    actionType: "create-borrow",
  };
}

function createWallet() {
  const signatureBase64 = btoa(
    String.fromCharCode(SIGNATURE_BYTE).repeat(SIGNATURE_LENGTH_BYTES)
  );
  const latestBlockhash = {
    blockhash: WALLET_ADDRESS,
    lastValidBlockHeight: BLOCK_HEIGHT,
  } satisfies Awaited<ReturnType<SolanaRpcConnection["getLatestBlockhash"]>>;
  const transactionResponse = {
    signature: TRANSACTION_SIGNATURE,
  } satisfies Awaited<
    ReturnType<SolanaTransactionSigner["signAndSendTransaction"]>
  >;
  const connection = {
    getGenesisHash: vi
      .fn<SolanaRpcConnection["getGenesisHash"]>()
      .mockResolvedValue(
        MAINNET_GENESIS_HASH satisfies Awaited<
          ReturnType<SolanaRpcConnection["getGenesisHash"]>
        >
      ),
    getLatestBlockhash: vi
      .fn<SolanaRpcConnection["getLatestBlockhash"]>()
      .mockResolvedValue(latestBlockhash),
  };
  const signer = {
    signAndSendTransaction: vi
      .fn<SolanaTransactionSigner["signAndSendTransaction"]>()
      .mockResolvedValue(transactionResponse),
  };
  const wallet = {
    address: WALLET_ADDRESS,
    signMessage: vi
      .fn<ConnectedSolanaWallet["signMessage"]>()
      .mockResolvedValue(
        signatureBase64 satisfies Awaited<
          ReturnType<ConnectedSolanaWallet["signMessage"]>
        >
      ),
    getConnection: vi
      .fn<ConnectedSolanaWallet["getConnection"]>()
      .mockResolvedValue(
        connection satisfies Awaited<
          ReturnType<ConnectedSolanaWallet["getConnection"]>
        >
      ),
    getSigner: vi
      .fn<ConnectedSolanaWallet["getSigner"]>()
      .mockResolvedValue(
        signer satisfies Awaited<ReturnType<ConnectedSolanaWallet["getSigner"]>>
      ),
  } satisfies ConnectedSolanaWallet;
  return { wallet, connection, signer };
}
