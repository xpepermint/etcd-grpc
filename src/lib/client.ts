import * as path from "path";
import * as grpc from "grpc";
import { EventEmitter } from "events";
import { normalizeKeys } from "object-keys-normalizer";

/**
 * Key value interface.
 */
export interface IKeyValue {
  /**
   * The key in bytes. An empty key is not allowed.
   */
  key: Buffer;
  /**
   * The revision of last creation on this key.
   */
  createRevision: number | string;
  /**
   * The revision of last modification on this key.
   */
  modRevision: number | string;
  /**
   * The version of the key. A deletion resets the version
   * to zero and any modification of the key increases its version.
   */
  version: number | string;
  /**
   * The value held by the key, in bytes.
   */
  value: Buffer;
  /**
   * The ID of the lease that attached to key. When the attached lease
   * expires, the key will be deleted. If lease is 0, then no lease is
   * attached to the key.
   */
  lease: number | string;
}

/**
 * Available values for event type.
 */
export enum EventType {
  /**
   * Filter out put event.
   */
  PUT = 0,
  /**
   * Filter out delete event.
   */
  DELETE = 1,
}

/**
 * Event interface.
 */
export interface IEvent {
  /**
   * The kind of event. If type is a PUT, it indicates new data has been stored to the
   * key. If type is a DELETE, it indicates the key was deleted.
   */
  type: EventType;
  /**
   * Holds the KeyValue for the event. A PUT event contains current kv pair. A PUT event
   * with kv.Version=1 indicates the creation of a key. A DELETE/EXPIRE event contains
   * the deleted key with its modification revision set to the revision of deletion.
   */
  kv: IKeyValue;
  /**
   * Holds the key-value pair before the event happens.
   */
  prevKv: IKeyValue;
}

/**
 * Response header interface.
 */
export interface IResponseHeader {
  /**
   * The ID of the cluster which sent the response.
   */
  clusterId: number | string;
  /**
   * The ID of the member which sent the response.
   */
  memberId: number | string;
  /**
   * The key-value store revision when the request was applied. This value is the current
   * revision of etcd. It is incremented every time the etcd database is modified.
   */
  revision: number | string;
  /**
   * The raft term when the request was applied. This number will increase whenever an etcd
   * master election happens in the cluster. If this number is increasing rapidly, you may
   * need to tune the election timeout.
   */
  raftTerm: number | string;
}

/**
 * Client class scaffold.
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
    this.rpc = grpc.load(path.join(__dirname, "..", "..", "proto", "rpc.proto")).etcdserverpb;
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
      this.client[command](this.normalizeRequestObject(req), (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.normalizeResponseObject(res));
        }
      });
    });
  }

  /**
   * Returns normalized request object.
   */
  protected normalizeRequestObject(req) {
    let data = normalizeKeys(req, "snake");

    if (data.id) {
      data.ID = data.id;
      delete data.id;
    }
    if (data.ttl) {
      data.TTL = data.ttl;
      delete data.ttl;
    }

    return data;
  }

  /**
   * Returns normalized response object.
   */
  protected normalizeResponseObject(req) {
    let data = normalizeKeys(req, "camel");
    return data;
  }

  /**
   * Returns true if the client is defined.
   */
  public isConnected() {
    return !!this.client;
  }
}
