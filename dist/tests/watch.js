"use strict";
exports.__esModule = true;
var ava_1 = require("ava");
var __1 = require("..");
ava_1["default"].cb("method `watch` starts listening for changes", function (t) {
    var watcher = new __1.WatchClient();
    watcher.watch({
        key: new Buffer("\0")
    });
    watcher.on("data", function (res) {
        watcher.close();
        t.deepEqual(Object.keys(res), ["header", "watchId", "created", "canceled", "compactRevision", "events"]);
        t.deepEqual(Object.keys(res.header), ["clusterId", "memberId", "revision", "raftTerm"]);
        t.end();
    });
});
ava_1["default"].cb("throws error when no connection", function (t) {
    var watcher = new __1.WatchClient({
        endpoints: ["127.0.0.1:7891"]
    });
    watcher.watch({
        key: new Buffer("\0")
    });
    watcher.on("error", function (e) {
        t.is(__1.getErrorKind(e) === __1.ErrorKind.CONNECTION_FAILED, true);
        t.end();
    });
});
ava_1["default"].cb("method `reconnect` connects to the next available endpoint", function (t) {
    var watcher = new __1.WatchClient({
        endpoints: ["127.0.0.1:7891", "127.0.0.1:2379"]
    });
    watcher.on("error", function (e) {
        t.is(__1.getErrorKind(e) === __1.ErrorKind.CONNECTION_FAILED, true);
        watcher.reconnect();
        watcher.watch({
            key: new Buffer("\0")
        });
    });
    watcher.on("data", function (res) {
        watcher.close();
        t.pass();
        t.end();
    });
});
//# sourceMappingURL=watch.js.map