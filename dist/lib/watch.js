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
var incstr = require("incstr");
var FilterType;
(function (FilterType) {
    FilterType[FilterType["NOPUT"] = 0] = "NOPUT";
    FilterType[FilterType["NODELETE"] = 1] = "NODELETE";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
var WatchClient = (function (_super) {
    __extends(WatchClient, _super);
    function WatchClient(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.endpoints, endpoints = _c === void 0 ? ["127.0.0.1:2379"] : _c, _d = _b.connect, connect = _d === void 0 ? true : _d;
        var _this = _super.call(this, "Watch", { endpoints: endpoints, connect: connect }) || this;
        _this.watchId = "0";
        _this.watching = false;
        return _this;
    }
    WatchClient.prototype.close = function () {
        this.stream.removeAllListeners();
        this.stream.once("error", function () { });
        this.stream.end();
        this.stream = null;
        this.watchId = "0";
        this.watching = false;
        _super.prototype.close.call(this);
    };
    WatchClient.prototype.watch = function (req) {
        var _this = this;
        if (this.watching) {
            return;
        }
        if (!this.stream) {
            this.stream = this.client.watch();
            this.stream.on("data", function (res) {
                _this.emit("data", _this.normalizeResponseObject(res));
            });
            this.stream.on("finish", function (res) {
                _this.emit("finish", _this.normalizeResponseObject(res));
            });
            this.stream.on("end", function (res) {
                _this.emit("end", _this.normalizeResponseObject(res));
            });
            this.stream.on("close", function (res) {
                _this.emit("close", _this.normalizeResponseObject(res));
            });
            this.stream.on("error", function (err) {
                _this.emit("error", _this.normalizeResponseObject(err));
            });
        }
        this.watchId = incstr(this.watchId);
        this.stream.write(this.normalizeRequestObject({
            createRequest: req
        }));
    };
    WatchClient.prototype.cancel = function () {
        if (!this.watching) {
            return;
        }
        this.stream.write(this.normalizeRequestObject({
            cancelRequest: { watchId: this.watchId }
        }));
    };
    WatchClient.prototype.isWatching = function () {
        return this.watching;
    };
    return WatchClient;
}(client_1.Client));
exports.WatchClient = WatchClient;
//# sourceMappingURL=watch.js.map