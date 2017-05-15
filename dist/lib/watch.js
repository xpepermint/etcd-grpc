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
var object_keys_normalizer_1 = require("object-keys-normalizer");
var WatchClient = (function (_super) {
    __extends(WatchClient, _super);
    function WatchClient(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.endpoints, endpoints = _c === void 0 ? ["127.0.0.1:2379"] : _c, _d = _b.connect, connect = _d === void 0 ? true : _d;
        var _this = _super.call(this, "Watch", { endpoints: endpoints, connect: connect }) || this;
        _this.watchId = "0";
        _this.watching = false;
        return _this;
    }
    WatchClient.prototype.connect = function () {
        var _this = this;
        if (this.client) {
            return;
        }
        _super.prototype.connect.call(this);
        function emitEvent(name, res) {
            var data = object_keys_normalizer_1.normalizeKeys(res, "camel");
            this.emit(name, data);
        }
        this.stream = this.client.watch();
        this.stream.on("data", function (res) { return emitEvent.call(_this, "data", res); });
        this.stream.on("finish", function (res) { return emitEvent.call(_this, "finish", res); });
        this.stream.on("end", function (res) { return emitEvent.call(_this, "end", res); });
        this.stream.on("close", function (res) { return emitEvent.call(_this, "close", res); });
        this.stream.on("error", function (res) { return emitEvent.call(_this, "error", res); });
    };
    WatchClient.prototype.close = function () {
        if (!this.client) {
            return;
        }
        this.stream.end();
        _super.prototype.close.call(this);
    };
    WatchClient.prototype.watch = function (req) {
        if (this.watching) {
            return;
        }
        this.watching = true;
        this.watchId = (parseInt(this.watchId) + 1).toString();
        var data = object_keys_normalizer_1.normalizeKeys({
            createRequest: req
        }, "snake");
        this.stream.write(data);
    };
    WatchClient.prototype.cancel = function () {
        if (!this.watching) {
            return;
        }
        this.watching = false;
        var data = object_keys_normalizer_1.normalizeKeys({
            cancelRequest: { watchId: this.watchId }
        }, "snake");
        this.stream.write(data);
    };
    WatchClient.prototype.isWatching = function () {
        return this.watching;
    };
    return WatchClient;
}(client_1.Client));
exports.WatchClient = WatchClient;
//# sourceMappingURL=watch.js.map