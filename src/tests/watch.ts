import test from "ava";
import { Etcd, Watcher, getErrorKind, ErrorKind } from "..";

test.cb("method `watch` starts listening for changes", (t) => {
  const client = new Etcd();
  const watcher = client.createWatcher();
  watcher.watch({
    key: new Buffer("\0"),
  });
  watcher.on("data", (res) => {
    watcher.close();
    t.deepEqual(Object.keys(res), ["header", "watchId", "created", "canceled", "compactRevision", "events"]);
    t.deepEqual(Object.keys(res.header), ["clusterId", "memberId", "revision", "raftTerm"]);
    t.end();
  });
});

test.cb("throws error when no connection", (t) => {
  const client = new Etcd({
    endpoints: ["127.0.0.1:7891"],
  });
  const watcher = client.createWatcher();
  watcher.watch({
    key: new Buffer("\0"),
  });
  watcher.on("error", (e) => {
    t.is(getErrorKind(e) === ErrorKind.CONNECTION_FAILED, true);
    t.end();
  });
});

test.cb("method `reconnect` connects to the next available endpoint", (t) => {
  const client = new Etcd({
    endpoints: ["127.0.0.1:7891", "127.0.0.1:2379"],
  });
  const watcher = client.createWatcher();
  watcher.on("error", (e) => {
    t.is(getErrorKind(e) === ErrorKind.CONNECTION_FAILED, true);
    client.reconnect();
    watcher.watch({
      key: new Buffer("\0"),
    });
  });
  watcher.on("data", (res) => {
    watcher.close();
    t.pass();
    t.end();
  });
  watcher.watch({
    key: new Buffer("\0"),
  });
});
