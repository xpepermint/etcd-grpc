import { Client, IKeyValue, IResponseHeader } from "./client";

/**
 * First or last key.
 */
export const EDGE_KEY = "\0";

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
   * The upper bound on the requested range [key, rangeEnd). If rangeEnd
   * is '\0', the range is all keys >= key. If the rangeEnd is one bit larger
   * than the given key, then the range requests get the all keys with the prefix
   * (the given key). If both key and rangeEnd are '\0', then range requests
   * returns all keys.
   */
  rangeEnd?: Buffer;
  /**
   * A limit on the number of keys returned for the request.
   */
  limit?: number;
  /**
   * The point-in-time of the key-value store to use for the range. If revision
   * is less or equal to zero, the range is over the newest key-value store. If
   * the revision has been compacted, ErrCompacted is returned as a response.
   */
  revision?: number;
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
  count: string;
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
  lease?: string;
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
  deleted: string;
}

/**
 * Compaction request interface.
 */
export interface ICompactionRequest {
  /**
   * The key-value store revision for the compaction operation.
   */
  revision?: string | number;
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
  version?: string | number;
  /**
   * The creation revision of the given key
   */
  createRevision?: string | number;
  /**
   * The last modified revision of the given key.
   */
  modRevision?: string | number;
  /**
   * The value of the given key, in bytes.
   */
  value?: Buffer;
}

/**
 * Key-value client client.
 */
export class KVClient extends Client {
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
    super("KV", { endpoints, connect });
  }

  /**
   * Puts the given key into the key-value store. A put request increments the
   * revision of the key-value store and generates one event in the event history.
   */
  public put(req: IPutRequest): Promise<IPutResponse> {
    return this.perform("put", req);
  }

  /**
   * Gets the keys in the range from the key-value store.
   */
  public range(req: IRangeRequest): Promise<IRangeResponse> {
    return this.perform("range", req);
  }

  /**
   * Deletes the given range from the key-value store. A delete request increments
   * the revision of the key-value store and generates a delete event in the event
   * history for every deleted key.
   */
  public deleteRange(req: IDeleteRangeRequest): Promise<IDeleteRangeResponse> {
    return this.perform("deleteRange", req);
  }

  /**
   * Compacts the event history in the etcd key-value store. The key-value store
   * should be periodically compacted or the event history will continue to grow
   * indefinitely.
   */
  public txn(req: ITxnRequest): Promise<ITxnResponse> {
    return this.perform("txn", req);
  }

  /**
   * Compacts the event history in the etcd key-value store. The key-value store
   * should be periodically compacted or the event history will continue to grow
   * indefinitely.
   */
  public compact(req: ICompactionRequest = {}): Promise<ICompactionResponse> {
    return this.perform("compact", req);
  }
}
