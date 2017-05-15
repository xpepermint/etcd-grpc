import test from "ava";
import { WatchClient, getErrorKind, EDGE_KEY } from "..";

test.cb("method `watch` starts listening for changes", (t) => {
  const watcher = new WatchClient();
  watcher.watch({
    key: new Buffer(EDGE_KEY),
  });
  watcher.on("data", (res) => {
    watcher.close();
    t.deepEqual(Object.keys(res), ["header", "watchId", "created", "canceled", "compactRevision", "events"]);
    t.deepEqual(Object.keys(res.header), ["clusterId", "memberId", "revision", "raftTerm"]);
    t.end();
  });
});

test.cb("throws error when no connection", (t) => {
  const watcher = new WatchClient({
    endpoints: ["127.0.0.1:7891"],
  });
  watcher.watch({
    key: new Buffer(EDGE_KEY),
  });
  watcher.on("error", (e) => {
    t.is(getErrorKind(e) === "CONNECTION_FAILED", true);
    t.end();
  });
});

test.cb("method `reconnect` connects to the next available endpoint", (t) => {
  const watcher = new WatchClient({
    endpoints: ["127.0.0.1:7891", "127.0.0.1:2379"],
  });
  watcher.on("error", (e) => {
    t.is(getErrorKind(e) === "CONNECTION_FAILED", true);
    watcher.reconnect();
    watcher.watch({
      key: new Buffer(EDGE_KEY),
    });
  });
  watcher.on("data", (res) => {
    watcher.close();
    t.pass();
    t.end();
  });
});
