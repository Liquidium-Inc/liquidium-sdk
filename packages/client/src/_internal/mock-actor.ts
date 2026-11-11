import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";

const EmptyActor = Actor.createActorClass(({ IDL }) => IDL.Service({}));

export function mockActor<Methods extends object>(methods: Methods) {
  return Object.assign(
    new EmptyActor({ canisterId: Principal.anonymous() }),
    methods
  );
}
