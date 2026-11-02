import type { IcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import { Principal } from "@icp-sdk/core/principal";
import type { Channel, Signer } from "@icp-sdk/signer";
import type { IcpRecoveryAuthorization } from "@liquidium/client";
import { expect, test, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import {
  type EthereumConnection,
  signEthereumMessage,
  withOisyAuthorization,
  withSignerChannel,
} from "../wallet";

test("opens the signer popup synchronously and keeps the result if closing fails", async () => {
  // given
  const signer = mockDeep<Signer>();
  const operationResult = "transfer receipt";
  const operation = vi.fn(async () => operationResult);
  signer.openChannel.mockResolvedValue(
    mockDeep<Channel>() satisfies Awaited<ReturnType<Signer["openChannel"]>>
  );
  signer.closeChannel.mockRejectedValue(new Error("Popup already closed"));

  // when
  const result = withSignerChannel(signer, operation);
  const openedBeforeYield = signer.openChannel.mock.calls.length > 0;
  const wasPinned = !signer.autoCloseTransportChannel;

  // then
  expect(openedBeforeYield).toBe(true);
  expect(wasPinned).toBe(true);
  await expect(result).resolves.toBe(operationResult);
  expect(signer.autoCloseTransportChannel).toBe(true);
  expect(operation).toHaveBeenCalledOnce();
  expect(signer.closeChannel).toHaveBeenCalledOnce();
});

test("does not authorize when the wallet no longer shares the selected account", async () => {
  // given
  const signer = mockDeep<Signer>();
  const account: IcrcAccount = {
    owner: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
  };
  const operation =
    vi.fn<(authorization: IcpRecoveryAuthorization) => Promise<void>>();
  signer.openChannel.mockResolvedValue(
    mockDeep<Channel>() satisfies Awaited<ReturnType<Signer["openChannel"]>>
  );
  signer.closeChannel.mockResolvedValue(
    undefined satisfies Awaited<ReturnType<Signer["closeChannel"]>>
  );
  signer.getAccounts.mockResolvedValue(
    [] satisfies Awaited<ReturnType<Signer["getAccounts"]>>
  );

  // when
  const result = withOisyAuthorization(
    { signer, accounts: [account] },
    account,
    operation
  );

  // then
  await expect(result).rejects.toThrow("no longer available");
  expect(operation).not.toHaveBeenCalled();
  expect(signer.closeChannel).toHaveBeenCalledOnce();
});

test("authorizes the selected OISY principal and subaccount", async () => {
  // given
  const signer = mockDeep<Signer>();
  const SUBACCOUNT_BYTES = 32;
  const SUBACCOUNT_FILL_BYTE = 1;
  const account: IcrcAccount = {
    owner: Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai"),
    subaccount: new Uint8Array(SUBACCOUNT_BYTES).fill(SUBACCOUNT_FILL_BYTE),
  };
  signer.openChannel.mockResolvedValue(
    mockDeep<Channel>() satisfies Awaited<ReturnType<Signer["openChannel"]>>
  );
  signer.closeChannel.mockResolvedValue(
    undefined satisfies Awaited<ReturnType<Signer["closeChannel"]>>
  );
  signer.getAccounts.mockResolvedValue([account] satisfies Awaited<
    ReturnType<Signer["getAccounts"]>
  >);

  // when
  const authorization = await withOisyAuthorization(
    { signer, accounts: [account] },
    account,
    async (value) => value
  );

  // then
  expect(authorization.type).toBe("icp_caller");
  expect((await authorization.agent.getPrincipal()).toText()).toBe(
    account.owner.toText()
  );
  expect(authorization.subaccount).toEqual(account.subaccount);
});

test("does not sign if the Ethereum wallet account changed", async () => {
  // given
  const connectedAddress = "0x1111111111111111111111111111111111111111";
  const changedAddress = "0x2222222222222222222222222222222222222222";
  const connection = mockDeep<EthereumConnection>({
    address: connectedAddress,
  });
  connection.wallet.getAddresses.mockResolvedValue([
    changedAddress,
  ] satisfies Awaited<
    ReturnType<EthereumConnection["wallet"]["getAddresses"]>
  >);
  const message = "Recovery message";

  // when
  const result = signEthereumMessage(connection, message);

  // then
  await expect(result).rejects.toThrow("account changed");
  expect(connection.wallet.signMessage).not.toHaveBeenCalled();
});
