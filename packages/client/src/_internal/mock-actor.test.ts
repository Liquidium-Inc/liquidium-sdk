import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { expect, test, vi } from "vite-plus/test";
import { mockActor } from "./mock-actor";

test("should keep mock methods and real actor metadata", async () => {
  // given
  const nonce = 7n;
  const getNonce = vi.fn<() => Promise<bigint>>().mockResolvedValue(nonce);

  // when
  const actor = mockActor({ get_nonce: getNonce });
  const result = await actor.get_nonce();

  // then
  expect(result).toBe(nonce);
  expect(actor.get_nonce).toBe(getNonce);
  expect(Actor.canisterIdOf(actor)).toEqual(Principal.anonymous());
  expect(Actor.interfaceOf(actor)._fields).toEqual([]);
});
