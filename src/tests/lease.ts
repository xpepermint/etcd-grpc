import test from "ava";
import { LeaseClient } from "..";

test.serial("method `leaseGrant` creates new TTL lease", async (t) => {
  const lease = new LeaseClient();
  const res = await lease.leaseGrant({
    ttl: "10",
  });
  t.deepEqual(Object.keys(res), ["header", "id", "ttl", "error"]);
  t.deepEqual(Object.keys(res.header), ["clusterId", "memberId", "revision", "raftTerm"]);
  t.is(res.ttl, "10");
});

test.serial("method `leaseRevoke` removes the lease", async (t) => {
  const lease = new LeaseClient();
  const res = await lease.leaseGrant({
    ttl: "10",
  }).then((res) => {
    return lease.leaseRevoke({
      id: res.id
    });
  });
  t.deepEqual(Object.keys(res.header), ["clusterId", "memberId", "revision", "raftTerm"]);
});
