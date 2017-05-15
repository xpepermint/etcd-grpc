import * as path from "path";
import * as grpc from "grpc";
import { EventEmitter } from "events";
import { normalizeKeys } from "object-keys-normalizer";
import { IRangeRequest, IRangeResponse, IPutRequest, IPutResponse, IDeleteRangeRequest,
  IDeleteRangeResponse } from "./messages";

/**
 * Path to gRPC definitions file.
 */
export const PROTO_FILE_PATH = path.join(__dirname, "..", "..", "proto", "rpc.proto");

/**
 * KV client class.
 */
export abstract class Client extends EventEmitter {
  /**
   * gRPC definitions object.
   */
  protected rpc;
  /**
   * Current client instance.
   */
  protected client;
  /**
   * RPC service name.
   */
  protected service;
  /**
   * Available endpoints.
   */
  public endpoints: string[];

  /**
   * Class constructor.
   */
  public constructor(service: string, {
    endpoints = ["127.0.0.1:2379"],
    connect = true,
  }: {
    endpoints?: string[];
    connect?: boolean;
  } = {}) {
    super();

    this.service = service;
    this.rpc = grpc.load(PROTO_FILE_PATH).etcdserverpb;
    this.endpoints = [].concat(endpoints);

    if (connect) {
      this.connect();
    }
  }

  /**
   * Initializes the client connection.
   */
  public connect() {
    if (this.client) { return; }

    const endpoint = this.endpoints[0];
    const credentials = grpc.credentials.createInsecure();
    this.client = new this.rpc[this.service](endpoint, credentials);

    this.endpoints.push(this.endpoints.splice(0, 1)[0]); // roundrobin endpoints
  }

  /**
   * Closes client connection.
   */
  public close() {
    if (!this.client) { return; }

    grpc.getClientChannel(this.client).close();
    this.client = null;
  }

  /**
   * Reconnects to the next available server in RoundRobin style.
   */
  public reconnect() {
    this.close();
    this.connect();
  }

  /**
   * Performs service command.
   */
  protected perform(command: string, req) {
    return new Promise((resolve, reject) => {
      this.client[command](normalizeKeys(req, "snake"), (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(normalizeKeys(res, "camel"));
        }
      });
    });
  }

  /**
   * Returns true if the client is defined.
   */
  public isConnected() {
    return !!this.client;
  }

}
