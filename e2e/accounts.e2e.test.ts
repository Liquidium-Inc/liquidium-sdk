import { expect, test } from "vitest";
import {
  Chain,
  LiquidiumClient,
  LiquidiumErrorCode,
} from "../packages/client/src";
import { describeLive } from "./_internal/live";
import {
  createBitcoinjsTestWallet,
  createEthereumTestWallet,
} from "./_internal/test-wallets";

describeLive("live account signing e2e", () => {
  test("should create and resolve a profile with a real Ethereum signature", async () => {
    // given
    const client = new LiquidiumClient();
    const { account, walletAdapter } = createEthereumTestWallet();

    // when
    const profileId = await client.accounts.createProfile({
      account,
      chain: Chain.ETH,
      walletAdapter,
    });
    const resolvedProfileId = await client.accounts.getProfileId(account);
    const linkedWallets = await client.accounts.listLinkedWallets(profileId);

    // then
    expect(profileId).toBeTruthy();
    expect(resolvedProfileId).toBe(profileId);
    expect(linkedWallets).toContainEqual({
      address: account,
      chain: Chain.ETH,
    });
  });

  test("should create and resolve a profile with a bitcoinjs signature", async () => {
    // given
    const client = new LiquidiumClient();
    const { account, walletAdapter } = createBitcoinjsTestWallet();

    // when
    const profileId = await client.accounts.createProfile({
      account,
      chain: Chain.BTC,
      walletAdapter,
    });

    // then
    expect(profileId).toBeTruthy();
  });

  test("should return null for an unknown wallet address", async () => {
    // given
    const client = new LiquidiumClient();
    const { account } = createEthereumTestWallet();

    // when
    const profileId = await client.accounts.getProfileId(account);

    // then
    expect(profileId).toBeNull();
  });

  test("should reject duplicate profile creation for the same Ethereum address", async () => {
    // given
    const client = new LiquidiumClient();
    const { account, walletAdapter } = createEthereumTestWallet();
    await client.accounts.createProfile({
      account,
      chain: Chain.ETH,
      walletAdapter,
    });

    // when
    const result = client.accounts.createProfile({
      account,
      chain: Chain.ETH,
      walletAdapter,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
    });
  });

  test("should reject duplicate profile creation for the same BTC address", async () => {
    // given
    const client = new LiquidiumClient();
    const { account, walletAdapter } = createBitcoinjsTestWallet();
    await client.accounts.createProfile({
      account,
      chain: Chain.BTC,
      walletAdapter,
    });

    // when
    const result = client.accounts.createProfile({
      account,
      chain: Chain.BTC,
      walletAdapter,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
    });
  });

  test("should reject profile creation with an invalid Ethereum signature", async () => {
    // given
    const client = new LiquidiumClient();
    const { account } = createEthereumTestWallet();
    const { walletAdapter } = createEthereumTestWallet();

    // when
    const result = client.accounts.createProfile({
      account,
      chain: Chain.ETH,
      walletAdapter,
    });

    // then
    await expect(result).rejects.toMatchObject({
      code: LiquidiumErrorCode.INVALID_ETH_SIGNATURE,
    });
  });
});
