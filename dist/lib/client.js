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
var path = require("path");
var grpc = require("grpc");
var events_1 = require("events");
var object_keys_normalizer_1 = require("object-keys-normalizer");
exports.PROTO_FILE_PATH = path.join(__dirname, "..", "..", "proto", "rpc.proto");
var Client = (function (_super) {
    __extends(Client, _super);
    function Client(service, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.endpoints, endpoints = _c === void 0 ? ["127.0.0.1:2379"] : _c, _d = _b.connect, connect = _d === void 0 ? true : _d;
        var _this = _super.call(this) || this;
        _this.service = service;
        _this.rpc = grpc.load(exports.PROTO_FILE_PATH).etcdserverpb;
        _this.endpoints = [].concat(endpoints);
        if (connect) {
            _this.connect();
        }
        return _this;
    }
    Client.prototype.connect = function () {
        if (this.client) {
            return;
        }
        var endpoint = this.endpoints[0];
        var credentials = grpc.credentials.createInsecure();
        this.client = new this.rpc[this.service](endpoint, credentials);
        this.endpoints.push(this.endpoints.splice(0, 1)[0]);
    };
    Client.prototype.close = function () {
        if (!this.client) {
            return;
        }
        grpc.getClientChannel(this.client).close();
        this.client = null;
    };
    Client.prototype.reconnect = function () {
        this.close();
        this.connect();
    };
    Client.prototype.perform = function (command, req) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.client[command](object_keys_normalizer_1.normalizeKeys(req, "snake"), function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(object_keys_normalizer_1.normalizeKeys(res, "camel"));
                }
            });
        });
    };
    Client.prototype.isConnected = function () {
        return !!this.client;
    };
    return Client;
}(events_1.EventEmitter));
exports.Client = Client;
//# sourceMappingURL=client.js.map