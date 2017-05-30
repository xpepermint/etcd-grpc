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
var KVClient = (function (_super) {
    __extends(KVClient, _super);
    function KVClient(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.endpoints, endpoints = _c === void 0 ? ["127.0.0.1:2379"] : _c, _d = _b.connect, connect = _d === void 0 ? true : _d;
        return _super.call(this, "KV", { endpoints: endpoints, connect: connect }) || this;
    }
    KVClient.prototype.put = function (req) {
        return this.perform("put", req);
    };
    KVClient.prototype.range = function (req) {
        return this.perform("range", req);
    };
    KVClient.prototype.deleteRange = function (req) {
        return this.perform("deleteRange", req);
    };
    KVClient.prototype.txn = function (req) {
        return this.perform("txn", req);
    };
    KVClient.prototype.compact = function (req) {
        if (req === void 0) { req = {}; }
        return this.perform("compact", req);
    };
    return KVClient;
}(client_1.Client));
exports.KVClient = KVClient;
//# sourceMappingURL=kv.js.map