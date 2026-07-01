import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { WalletAdapter } from "../../packages/client/src";

const BTC_MESSAGE_PREFIX = Buffer.from(
  "\u0018Bitcoin Signed Message:\n",
  "utf8"
);
const COMPACT_SIGNATURE_HEADER_OFFSET = 27;
const COMPRESSED_SIGNATURE_HEADER_OFFSET = 4;
const BITCOIN_VARINT_UINT16_PREFIX = 0xfd;
const BITCOIN_VARINT_UINT32_PREFIX = 0xfe;
const BITCOIN_VARINT_MAX_SINGLE_BYTE_VALUE = 0xfc;
const BITCOIN_VARINT_MAX_UINT16_VALUE = 0xffff;
const BITCOIN_VARINT_PREFIX_BYTE_LENGTH = 1;
const UINT16_BYTE_LENGTH = 2;
const UINT32_BYTE_LENGTH = 4;

bitcoin.initEccLib(ecc);

export function createEthereumTestWallet(): {
  account: `0x${string}`;
  walletAdapter: WalletAdapter;
} {
  const account = privateKeyToAccount(generatePrivateKey());

  return {
    account: account.address,
    walletAdapter: {
      signMessage: async ({ message }) => {
        return await account.signMessage({ message });
      },
    },
  };
}

export function createBitcoinjsTestWallet(): {
  account: string;
  walletAdapter: WalletAdapter;
} {
  const ECPair = ECPairFactory(ecc);
  const keyPair = ECPair.makeRandom({ network: bitcoin.networks.bitcoin });
  const privateKey = keyPair.privateKey;
  const { address } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network: bitcoin.networks.bitcoin,
  });

  if (!address || !privateKey) {
    throw new Error("Unable to generate bitcoinjs test wallet");
  }

  return {
    account: address,
    walletAdapter: {
      signMessage: async ({ message }) => {
        return signBitcoinMessage(message, privateKey);
      },
    },
  };
}

function signBitcoinMessage(message: string, privateKey: Uint8Array): string {
  const messageHash = hashBitcoinMessage(message);
  const { signature, recoveryId } = ecc.signRecoverable(
    messageHash,
    privateKey
  );
  const compactSignatureHeader = Buffer.from([
    recoveryId +
      COMPACT_SIGNATURE_HEADER_OFFSET +
      COMPRESSED_SIGNATURE_HEADER_OFFSET,
  ]);

  return Buffer.concat([
    compactSignatureHeader,
    Buffer.from(signature),
  ]).toString("base64");
}

function hashBitcoinMessage(message: string): Buffer {
  const messageBytes = Buffer.from(message, "utf8");
  const payload = Buffer.concat([
    BTC_MESSAGE_PREFIX,
    encodeBitcoinVarInt(messageBytes.length),
    messageBytes,
  ]);

  return doubleSha256(payload);
}

function doubleSha256(bytes: Buffer): Buffer {
  return createHash("sha256")
    .update(createHash("sha256").update(bytes).digest())
    .digest();
}

function encodeBitcoinVarInt(value: number): Buffer {
  if (value <= BITCOIN_VARINT_MAX_SINGLE_BYTE_VALUE) {
    return Buffer.from([value]);
  }

  if (value <= BITCOIN_VARINT_MAX_UINT16_VALUE) {
    const buffer = Buffer.allocUnsafe(
      BITCOIN_VARINT_PREFIX_BYTE_LENGTH + UINT16_BYTE_LENGTH
    );
    buffer[0] = BITCOIN_VARINT_UINT16_PREFIX;
    buffer.writeUInt16LE(value, BITCOIN_VARINT_PREFIX_BYTE_LENGTH);
    return buffer;
  }

  const buffer = Buffer.allocUnsafe(
    BITCOIN_VARINT_PREFIX_BYTE_LENGTH + UINT32_BYTE_LENGTH
  );
  buffer[0] = BITCOIN_VARINT_UINT32_PREFIX;
  buffer.writeUInt32LE(value, BITCOIN_VARINT_PREFIX_BYTE_LENGTH);
  return buffer;
}
