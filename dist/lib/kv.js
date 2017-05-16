"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var client_1 = require("./client");
exports.EDGE_KEY = "\0";
exports.NONE_SORT_ORDER = 0;
exports.ASCEND_SORT_ORDER = 1;
exports.DESCEND_SORT_ORDER = 2;
exports.KEY_SORT_TARGET = 0;
exports.VERSION_SORT_TARGET = 1;
exports.CREATE_SORT_TARGET = 2;
exports.MOD_SORT_TARGET = 3;
exports.VALUE_SORT_TARGET = 4;
var KVClient = (function (_super) {
    __extends(KVClient, _super);
    function KVClient(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.endpoints, endpoints = _c === void 0 ? ["127.0.0.1:2379"] : _c, _d = _b.connect, connect = _d === void 0 ? true : _d;
        return _super.call(this, "KV", { endpoints: endpoints, connect: connect }) || this;
    }
    KVClient.prototype.range = function (req) {
        return this.perform("range", req);
    };
    KVClient.prototype.put = function (req) {
        return this.perform("put", req);
    };
    KVClient.prototype.deleteRange = function (req) {
        return this.perform("deleteRange", req);
    };
    KVClient.prototype.compact = function (req) {
        return this.perform("compact", req);
    };
    return KVClient;
}(client_1.Client));
exports.KVClient = KVClient;
//# sourceMappingURL=kv.js.map