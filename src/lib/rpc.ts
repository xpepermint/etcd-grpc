import * as path from "path";
import * as grpc from "grpc";
import { EventEmitter } from "events";
import { normalizeKeys } from "object-keys-normalizer";
import { Watcher } from "./watch";

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
 * Available values sort order.
 */
export enum SortOrder {
  /**
   * Default, no sorting.
   */
  NONE = 0,
  /**
   * Lowest target value first.
   */
  ASCEND = 1,
  /**
   * Highest target value first.
   */
  DESCEND = 2,
}

/**
 * Available values sort target kind.
 */
export enum SortTarget {
  KEY = 0,
  VERSION = 1,
  CREATE = 2,
  MOD = 3,
  VALUE = 4,
}

/**
 * Range request interface.
 */
export interface IRangeRequest {
  /**
   * The first key for the range. If it is not given, the request
   * only looks up key.
   */
  key: Buffer;
  /**
   * The upper bound on the requested range [key, range_end). If range_end is '\0',
   * the range is all keys >= key. If range_end is key plus one (e.g., "aa"+1 == "ab",
   * "a\xff"+1 == "b"), then the range request gets all keys prefixed with key. If
   * both key and range_end are '\0', then the range request returns all keys.
   */
  rangeEnd?: Buffer;
  /**
   * A limit on the number of keys returned for the request.
   */
  limit?: number | string;
  /**
   * The point-in-time of the key-value store to use for the range. If revision
   * is less or equal to zero, the range is over the newest key-value store. If
   * the revision has been compacted, ErrCompacted is returned as a response.
   */
  revision?: number | string;
  /**
   * The order for returned sorted results.
   */
  sortOrder?: SortOrder;
  /**
   * The key-value field to use for sorting.
   */
  sortTarget?: SortTarget;
  /**
   * Sets the range request to use serializable member-local reads. Range requests
   * are linearizable by default; linearizable requests have higher latency and lower
   * throughput than serializable requests but reflect the current consensus of the
   * cluster. For better performance, in exchange for possible stale reads, a
   * serializable range request is served locally without needing to reach consensus
   * with other nodes in the cluster.
   */
  serializable?: boolean;
  /**
   * When set returns only the keys and not the values.
   */
  keysOnly?: boolean;
  /**
   * When set returns only the count of the keys in the range.
   */
  countOnly?: boolean;
  /**
   * The lower bound for returned key mod revisions; all keys with lesser mod revisions
   * will be filtered away.
   */
  minModRevision?: number | string;
  /**
   * The upper bound for returned key mod revisions; all keys with greater mod revisions
   * will be filtered away.
   */
  maxModRevision?: number | string;
  /**
   * The lower bound for returned key create revisions; all keys with lesser create
   * trevisions will be filtered away.
   */
  minCreateRevision?: number | string;
  /**
   * The upper bound for returned key create revisions; all keys with greater create
   * revisions will be filtered away.
   */
  maxCreateRevision?: number | string;
}

/**
 * Range response interface.
 */
export interface IRangeResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
  /**
   * The list of key-value pairs matched by the range request. It's
   * empty when count is requested.
   */
  kvs: IKeyValue[];
  /**
   * Indicates if there are more keys to return in the requested range.
   */
  more: boolean;
  /**
   * Set to the number of keys within the range when requested.
   */
  count: number | string;
}

/**
 * Put request interface.
 */
export interface IPutRequest {
  /**
   * The key, in bytes, to put into the key-value store.
   */
  key: Buffer;
  /**
   * The value, in bytes, to associate with the key in the key-value store.
   */
  value: Buffer;
  /**
   * The lease ID to associate with the key in the key-value store. A lease
   * value of 0 indicates no lease.
   */
  lease?: number | string;
  /**
   * If true, etcd gets the previous key-value pair before changing it. The
   * previous key-value pair will be returned in the put response.
   */
  prevKv?: boolean;
  /**
   * If set, etcd updates the key using its current value. Returns an error
   * if the key does not exist.
   */
  ignoreValue?: boolean;
  /**
   * If set, etcd updates the key using its current lease. Returns an error
   * if the key does not exist.
   */
  ignoreLease?: boolean;
}

/**
 * Put response interface.
 */
export interface IPutResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
}

/**
 * Delte range request interface.
 */
export interface IDeleteRangeRequest {
  /**
   * The first key to delete in the range.
   */
  key: Buffer;
  /**
   * The key following the last key to delete for the range [key, rangeEnd).
   * If rangeEnd is not given, the range is defined to contain only the key
   * argument. If rangeEnd is '\0', the range is all keys greater than or equal
   * to the key argument.
   */
  rangeEnd?: Buffer;
  /**
   * If set, etcd gets the previous key-value pairs before deleting it. The
   * previous key-value pairs will be returned in the delete response.
   */
  prevKv?: boolean;
}

/**
 * Delete range response interface.
 */
export interface IDeleteRangeResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
  /**
   * The number of keys deleted by the delete range request.
   */
  deleted: number | string;
}

/**
 * Compaction request interface.
 */
export interface ICompactionRequest {
  /**
   * The key-value store revision for the compaction operation.
   */
  revision?: number | string;
  /**
   * When true the RPC will wait until the compaction is physically applied to the local
   * database such that compacted entries are totally removed from the backend database.
   */
  physical?: boolean;
}

/**
 * Compaction response interface.
 */
export interface ICompactionResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
}

/**
 * Transaction request interface.
 *
 * The implementation hinges around a powerful primitive which we call MultiOp. All
 * other database operations except for iteration are implemented as a single call to
 * MultiOp. A MultiOp is applied atomically and consists of three components:
 *
 * 1. A list of tests called guard. Each test in guard checks a single entry in the
 *    database. It may check for the absence or presence of a value, or compare with
 *    a given value. Two different tests in the guard may apply to the same or different
 *    entries in the database. All tests in the guard are applied and MultiOp returns
 *    the results. If all tests are true, MultiOp executes t op (see item 2 below),
 *    otherwise it executes f op (see item 3 below).
 * 2. A list of database operations called t op. Each operation in the list is either an
 *    insert, delete, or lookup operation, and applies to a single database entry. Two
 *    different operations in the list may apply to the same or different entries in the
 *    database. These operations are executed if guard evaluates to true.
 * 3. A list of database operations called f op. Like t op, but executed if guard
 *    evaluates to false.
 */
export interface ITxnRequest {
  /**
   * A list of predicates representing a conjunction of terms. If the comparisons succeed,
   * then the success requests will be processed in order, and the response will contain
   * their respective responses in order. If the comparisons fail, then the failure
   * requests will be processed in order, and the response will contain their respective
   * responses in order.
   */
  compare: ICompare | ICompare[];
  /**
   * A list of requests which will be applied when compare evaluates to true.
   */
  success: IRequestOp | IRequestOp[];
  /**
   * A list of requests which will be applied when compare evaluates to false.
   */
  failure: IRequestOp | IRequestOp[];
}

/**
 * Transaction response interface.
 */
export interface ITxnResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
  /**
   * Set to true if the compare evaluated to true or false otherwise.
   */
  succeeded: boolean;
  /**
   * A list of responses corresponding to the results from applying success if
   * succeeded is true or failure if succeeded is false.
   */
  responses: IResponseOp[];
}

/**
 * Request operation interface (e.g. for transaction).
 */
export interface IRequestOp {
  requestRange?: IRangeRequest;
  requestPut?: IPutRequest;
  requestDeleteRange?: IDeleteRangeRequest;
}
/**
 * Response operation interface (e.g. for transaction).
 */
export interface IResponseOp {
  responseRange: IRangeResponse;
  responsePut: IPutResponse;
  responseDeleteRange: IDeleteRangeResponse;
}

/**
 * Available logical comparison operations.
 */
export enum CompareResult {
  EQUAL = 0,
  GREATER = 1,
  LESS = 2,
  NOT_EQUAL = 3,
}

/**
 * Available options for a key-value field to inspect for the comparison.
 */
export enum CompareTarget {
  VERSION = 0,
  CREATE = 1,
  MOD = 2,
  VALUE = 3,
}

/**
 * Compare interface.
 */
export interface ICompare {
  /**
   * A logical comparison operation.
   */
  result?: CompareResult;
  /**
   * The key-value field to inspect for the comparison.
   */
  target?: CompareTarget;
  /**
   * The subject key for the comparison operation.
   */
  key?: Buffer;
  /**
   * The version of the given key
   */
  version?: number | string;
  /**
   * The creation revision of the given key
   */
  createRevision?: number | string;
  /**
   * The last modified revision of the given key.
   */
  modRevision?: number | string;
  /**
   * The value of the given key, in bytes.
   */
  value?: Buffer;
}

/**
 * Grant lease request interface.
 */
export interface ILeaseGrantRequest {
  /**
   * The advisory time-to-live in seconds.
   */
  ttl?: number | string;
  /**
   * The requested ID for the lease. If ID is set to 0, the lessor chooses an ID.
   */
  id?: number | string;
}

/**
 * Grant lease response interface.
 */
export interface ILeaseGrantResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
  /**
   * The lease ID for the granted lease.
   */
  id: number | string;
  /**
   * the server chosen lease time-to-live in seconds.
   */
  ttl: number | string;
  /**
   * Error message.
   */
  error: string;
}

/**
 * Revoke lease request interface.
 */
export interface ILeaseRevokeRequest {
  /**
   * The lease ID to revoke. When the ID is revoked, all associated keys will be deleted.
   */
  id?: number | string;
}

/**
 * Revoke lease response interface.
 */
export interface ILeaseRevokeResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
}

/**
 * KeepAlive lease request interface.
 */
export interface ILeaseKeepAliveRequest {
  /**
   * The lease ID for the lease to keep alive.
   */
  id?: number | string;
}

/**
 * KeepAlive lease response interface.
 */
export interface ILeaseKeepAliveResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
  /**
   * The lease ID from the keep alive request.
   */
  id: number | string;
  /**
   * The new time-to-live for the lease.
   */
  ttl: number | string;
}

/**
 * Client class scaffold.
 */
export class Etcd {
  /**
   * gRPC definitions object.
   */
  readonly rpc = grpc.load(path.join(__dirname, "..", "..", "proto", "rpc.proto")).etcdserverpb;
  /**
   * KV service instance.
   */
  protected kvClient = null;
  /**
   * Lease service instance.
   */
  protected leaseClient = null;
  /**
   * Watch service instance.
   */
  protected watchClient = null;
  /**
   * Available endpoints.
   */
  public endpoints: string[];

  /**
   * Class constructor.
   */
  public constructor({
    endpoints = ["127.0.0.1:2379"],
    connect = true,
  }: {
    endpoints?: string[];
    connect?: boolean;
  } = {}) {

    this.endpoints = [].concat(endpoints);

    if (connect) {
      this.connect();
    }
  }

  /**
   * Connects services.
   */
  public connect() {
    if (this.kvClient) { return; }

    const endpoint = this.endpoints[0];
    const credentials = grpc.credentials.createInsecure();

    this.kvClient = new this.rpc["KV"](endpoint, credentials);
    this.leaseClient = new this.rpc["Lease"](endpoint, credentials);
    this.watchClient = new this.rpc["Watch"](endpoint, credentials);

    this.endpoints.push(this.endpoints.splice(0, 1)[0]); // roundrobin endpoints
  }

  /**
   * Closes services.
   */
  public close() {
    if (!this.kvClient) { return; }

    grpc.closeClient(this.kvClient);
    grpc.closeClient(this.leaseClient);
    grpc.closeClient(this.watchClient);

    this.kvClient = null;
    this.leaseClient = null;
    this.watchClient = null;
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
  public perform(service, command: string, req): Promise<any> {
    return new Promise((resolve, reject) => {
      service[command](this.normalizeRequestObject(req), (err, res) => {
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
  public normalizeRequestObject(req) {
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
  public normalizeResponseObject(req) {
    let data = normalizeKeys(req, "camel");
    return data;
  }

  /**
   * Returns true if the client is defined.
   */
  public isConnected() {
    return !!this.kvClient;
  }

  /**
   * Puts the given key into the key-value store. A put request increments the
   * revision of the key-value store and generates one event in the event history.
   */
  public put(req: IPutRequest): Promise<IPutResponse> {
    return this.perform(this.kvClient, "put", req);
  }

  /**
   * Gets the keys in the range from the key-value store.
   */
  public range(req: IRangeRequest): Promise<IRangeResponse> {
    return this.perform(this.kvClient, "range", req);
  }

  /**
   * Deletes the given range from the key-value store. A delete request
   * increments the revision of the key-value store and generates a delete event
   * in the event history for every deleted key.
   */
  public deleteRange(req: IDeleteRangeRequest): Promise<IDeleteRangeResponse> {
    return this.perform(this.kvClient, "deleteRange", req);
  }

  /**
   * Compacts the event history in the etcd key-value store. The key-value store
   * should be periodically compacted or the event history will continue to grow
   * indefinitely.
   */
  public txn(req: ITxnRequest): Promise<ITxnResponse> {
    return this.perform(this.kvClient, "txn", req);
  }

  /**
   * Compacts the event history in the etcd key-value store. The key-value store
   * should be periodically compacted or the event history will continue to grow
   * indefinitely.
   */
  public compact(req: ICompactionRequest = {}): Promise<ICompactionResponse> {
    return this.perform(this.kvClient, "compact", req);
  }

  /**
   * Creates a lease which expires if the server does not receive a keepAlive
   * within a given time to live period. All keys attached to the lease will be
   * expired and deleted if the lease expires. Each expired key generates a
   * delete event in the event history.
   */
  public leaseGrant(req: ILeaseGrantRequest): Promise<ILeaseGrantResponse> {
    return this.perform(this.leaseClient, "leaseGrant", req);
  }

  /**
   * Revokes a lease. All keys attached to the lease will expire and be deleted.
   */
  public leaseRevoke(req: ILeaseRevokeRequest): Promise<ILeaseRevokeResponse> {
    return this.perform(this.leaseClient, "leaseRevoke", req);
  }

  /**
   * Creates a watcher which listens for changes.
   */
  public createWatcher(): Watcher {
    return new Watcher(this);
  }
}
