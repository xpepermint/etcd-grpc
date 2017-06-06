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
var events_1 = require("events");
var FilterType;
(function (FilterType) {
    FilterType[FilterType["NOPUT"] = 0] = "NOPUT";
    FilterType[FilterType["NODELETE"] = 1] = "NODELETE";
})(FilterType = exports.FilterType || (exports.FilterType = {}));
var Watcher = (function (_super) {
    __extends(Watcher, _super);
    function Watcher(client) {
        var _this = _super.call(this) || this;
        _this.client = client;
        return _this;
    }
    Watcher.prototype.watch = function (req) {
        var _this = this;
        if (this.stream) {
            this.close();
        }
        this.stream = this.client.watchClient.watch();
        this.stream.on("data", function (res) {
            _this.emit("data", _this.client.normalizeResponseObject(res));
        });
        this.stream.on("finish", function (res) {
            _this.emit("finish", _this.client.normalizeResponseObject(res));
        });
        this.stream.on("end", function (res) {
            _this.emit("end", _this.client.normalizeResponseObject(res));
        });
        this.stream.on("close", function (res) {
            _this.emit("close", _this.client.normalizeResponseObject(res));
        });
        this.stream.on("error", function (err) {
            _this.emit("error", _this.client.normalizeResponseObject(err));
        });
        this.stream.write(this.client.normalizeRequestObject({
            createRequest: req
        }));
    };
    Watcher.prototype.close = function () {
        if (!this.stream) {
            return;
        }
        this.stream.removeAllListeners();
        this.stream.once("error", function () { });
        this.stream.end();
        this.stream = null;
    };
    Watcher.prototype.isWatching = function () {
        return !!this.stream;
    };
    return Watcher;
}(events_1.EventEmitter));
exports.Watcher = Watcher;
//# sourceMappingURL=watch.js.map