import test from "ava";
import { KVClient, getErrorKind, ErrorKind } from "..";

test.serial("method `put` sets a key with value", async (t) => {
  const kv = new KVClient();
  const res = await kv.put({
    key: new Buffer("name"),
    value: new Buffer("foo"),
  });
  t.deepEqual(Object.keys(res.header), ["clusterId", "memberId", "revision", "raftTerm"]);
});

test.serial("method `range` retrieves one or more keys", async (t) => {
  const kv = new KVClient();
  const res = await kv.put({
    key: new Buffer("name"),
    value: new Buffer("foo"),
  }).then(() => {
    return kv.range({
      key: new Buffer("name"),
    });
  });
  t.deepEqual(Object.keys(res.header), ["clusterId", "memberId", "revision", "raftTerm"]);
  t.deepEqual(Object.keys(res.kvs[0]), ["key", "createRevision", "modRevision", "version", "value", "lease"]);
  t.is(res.kvs[0].value.toString(), "foo");
  t.is(res.more, false);
  t.is(res.count, "1");
});

test.serial("method `deleteRange` removes the key", async (t) => {
  const kv = new KVClient();
  const res = await kv.put({
    key: new Buffer("name"),
    value: new Buffer("foo"),
  }).then(() => {
    return kv.deleteRange({
      key: new Buffer("name"),
    });
  }).then(() => {
    return kv.range({
      key: new Buffer("name"),
    });
  });
  t.deepEqual(Object.keys(res.header), ["clusterId", "memberId", "revision", "raftTerm"]);
  t.is(res.kvs.length, 0);
  t.is(res.more, false);
  t.is(res.count, "0");
});

test.serial("method `txn` executes operations in transaction", async (t) => {
  const kv = new KVClient({
    endpoints: ["127.0.0.1:7891", "127.0.0.1:2379"],
  });
  kv.reconnect();
  try {
    await kv.put({ // reset key
      key: new Buffer("name"),
      value: new Buffer(""),
    });
    let res = await Promise.all( // set keys
      [0, 1].map(() => {
        return kv.txn({
          compare: {
            result: 0,
            target: 3,
            key: new Buffer("name"),
            value: new Buffer("foo"),
          },
          success: [{
            requestPut: {
              key: new Buffer("name"),
              value: new Buffer("bar"),
            }
          }],
          failure: [{
            requestPut: {
              key: new Buffer("name"),
              value: new Buffer("foo"),
            }
          }]
        });
      })
    );
    t.is(res[0].succeeded, false);
    t.is(res[1].succeeded, true);
    t.pass();
  } catch (e) {
    t.fail();
  }
});

test.serial("method `compact` compacts etcd key-value store", async (t) => {
  const kv = new KVClient();
  try {
    const res = await kv.compact();
    t.deepEqual(Object.keys(res.header), ["clusterId", "memberId", "revision", "raftTerm"]);
  } catch (e) {
    if (e.message === "etcdserver: mvcc: required revision has been compacted") {
      t.pass();
    } else {
      throw e;
    }
  }
});

test.serial("method throws when no connection", async (t) => {
  const kv = new KVClient({
    endpoints: ["127.0.0.1:7891"],
  });
  try {
    await kv.range({
      key: new Buffer("name"),
    });
    t.fail();
  } catch (e) {
    t.is(getErrorKind(e) === ErrorKind.CONNECTION_FAILED, true);
  }
});

test.serial("method `reconnect` connects to the next available endpoint", async (t) => {
  const kv = new KVClient({
    endpoints: ["127.0.0.1:7891", "127.0.0.1:2379"],
  });
  kv.reconnect();
  try {
    await kv.range({
      key: new Buffer("name"),
    });
    t.pass();
  } catch (e) {
    t.fail();
  }
});
