"use strict";
exports.__esModule = true;
var path = require("path");
var grpc = require("grpc");
var object_keys_normalizer_1 = require("object-keys-normalizer");
var watch_1 = require("./watch");
var EventType;
(function (EventType) {
    EventType[EventType["PUT"] = 0] = "PUT";
    EventType[EventType["DELETE"] = 1] = "DELETE";
})(EventType = exports.EventType || (exports.EventType = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder[SortOrder["NONE"] = 0] = "NONE";
    SortOrder[SortOrder["ASCEND"] = 1] = "ASCEND";
    SortOrder[SortOrder["DESCEND"] = 2] = "DESCEND";
})(SortOrder = exports.SortOrder || (exports.SortOrder = {}));
var SortTarget;
(function (SortTarget) {
    SortTarget[SortTarget["KEY"] = 0] = "KEY";
    SortTarget[SortTarget["VERSION"] = 1] = "VERSION";
    SortTarget[SortTarget["CREATE"] = 2] = "CREATE";
    SortTarget[SortTarget["MOD"] = 3] = "MOD";
    SortTarget[SortTarget["VALUE"] = 4] = "VALUE";
})(SortTarget = exports.SortTarget || (exports.SortTarget = {}));
var CompareResult;
(function (CompareResult) {
    CompareResult[CompareResult["EQUAL"] = 0] = "EQUAL";
    CompareResult[CompareResult["GREATER"] = 1] = "GREATER";
    CompareResult[CompareResult["LESS"] = 2] = "LESS";
    CompareResult[CompareResult["NOT_EQUAL"] = 3] = "NOT_EQUAL";
})(CompareResult = exports.CompareResult || (exports.CompareResult = {}));
var CompareTarget;
(function (CompareTarget) {
    CompareTarget[CompareTarget["VERSION"] = 0] = "VERSION";
    CompareTarget[CompareTarget["CREATE"] = 1] = "CREATE";
    CompareTarget[CompareTarget["MOD"] = 2] = "MOD";
    CompareTarget[CompareTarget["VALUE"] = 3] = "VALUE";
})(CompareTarget = exports.CompareTarget || (exports.CompareTarget = {}));
var Etcd = (function () {
    function Etcd(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.endpoints, endpoints = _c === void 0 ? ["127.0.0.1:2379"] : _c, _d = _b.connect, connect = _d === void 0 ? true : _d;
        this.rpc = grpc.load(path.join(__dirname, "..", "..", "proto", "rpc.proto")).etcdserverpb;
        this.kvClient = null;
        this.leaseClient = null;
        this.watchClient = null;
        this.endpoints = [].concat(endpoints);
        if (connect) {
            this.connect();
        }
    }
    Etcd.prototype.connect = function () {
        if (this.kvClient) {
            return;
        }
        var endpoint = this.endpoints[0];
        var credentials = grpc.credentials.createInsecure();
        this.kvClient = new this.rpc["KV"](endpoint, credentials);
        this.leaseClient = new this.rpc["Lease"](endpoint, credentials);
        this.watchClient = new this.rpc["Watch"](endpoint, credentials);
        this.endpoints.push(this.endpoints.splice(0, 1)[0]);
    };
    Etcd.prototype.close = function () {
        if (!this.kvClient) {
            return;
        }
        grpc.closeClient(this.kvClient);
        grpc.closeClient(this.leaseClient);
        grpc.closeClient(this.watchClient);
        this.kvClient = null;
        this.leaseClient = null;
        this.watchClient = null;
    };
    Etcd.prototype.reconnect = function () {
        this.close();
        this.connect();
    };
    Etcd.prototype.perform = function (service, command, req) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            service[command](_this.normalizeRequestObject(req), function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(_this.normalizeResponseObject(res));
                }
            });
        });
    };
    Etcd.prototype.normalizeRequestObject = function (req) {
        var data = object_keys_normalizer_1.normalizeKeys(req, "snake");
        if (data.id) {
            data.ID = data.id;
            delete data.id;
        }
        if (data.ttl) {
            data.TTL = data.ttl;
            delete data.ttl;
        }
        return data;
    };
    Etcd.prototype.normalizeResponseObject = function (req) {
        var data = object_keys_normalizer_1.normalizeKeys(req, "camel");
        return data;
    };
    Etcd.prototype.isConnected = function () {
        return !!this.kvClient;
    };
    Etcd.prototype.put = function (req) {
        return this.perform(this.kvClient, "put", req);
    };
    Etcd.prototype.range = function (req) {
        return this.perform(this.kvClient, "range", req);
    };
    Etcd.prototype.deleteRange = function (req) {
        return this.perform(this.kvClient, "deleteRange", req);
    };
    Etcd.prototype.txn = function (req) {
        return this.perform(this.kvClient, "txn", req);
    };
    Etcd.prototype.compact = function (req) {
        if (req === void 0) { req = {}; }
        return this.perform(this.kvClient, "compact", req);
    };
    Etcd.prototype.leaseGrant = function (req) {
        return this.perform(this.leaseClient, "leaseGrant", req);
    };
    Etcd.prototype.leaseRevoke = function (req) {
        return this.perform(this.leaseClient, "leaseRevoke", req);
    };
    Etcd.prototype.createWatcher = function () {
        return new watch_1.Watcher(this);
    };
    return Etcd;
}());
exports.Etcd = Etcd;
//# sourceMappingURL=rpc.js.map