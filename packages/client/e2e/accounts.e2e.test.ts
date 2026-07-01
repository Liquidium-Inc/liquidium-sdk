import { expect, test } from "vitest";
import { Chain, LiquidiumClient } from "../src";
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

    // then
    expect(profileId).toBeTruthy();
    expect(resolvedProfileId).toBe(profileId);
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
    const resolvedProfileId = await client.accounts.getProfileId(account);

    // then
    expect(profileId).toBeTruthy();
    expect(resolvedProfileId).toBe(profileId);
  });
});
