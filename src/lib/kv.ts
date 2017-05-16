import { Client, IKeyValue, IResponseHeader } from "./client";

/**
 * First or last key.
 */
export const EDGE_KEY = "\0";

/**
 * No sorting (default).
 */
export const NONE_SORT_ORDER = 0;
/**
 * Lowest target value first.
 */
export const ASCEND_SORT_ORDER = 1;
/**
 * Highest target value first.
 */
export const DESCEND_SORT_ORDER = 2;

/**
 * Key name.
 */
export const KEY_SORT_TARGET = 0;
/**
 * Version number.
 */
export const VERSION_SORT_TARGET = 1;
/**
 * Created index.
 */
export const CREATE_SORT_TARGET = 2;
/**
 * Modified index.
 */
export const MOD_SORT_TARGET = 3;
/**
 * Key value.
 */
export const VALUE_SORT_TARGET = 4;

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
  sortOrder?: 0 | 1 | 2;
  /**
   * The key-value field to use for sorting.
   */
  sortTarget?: 0 | 1 | 2 | 3 | 4;
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
   * When set the RPC will wait until the compaction is physically applied to the local
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
   * Gets the keys in the range from the key-value store.
   */
  public range(req: IRangeRequest): Promise<IRangeResponse> {
    return this.perform("range", req);
  }

  /**
   * Puts the given key into the key-value store. A put request increments the
   * revision of the key-value store and generates one event in the event history.
   */
  public put(req: IPutRequest): Promise<IPutResponse> {
    return this.perform("put", req);
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
  public compact(req: ICompactionRequest): Promise<ICompactionResponse> {
    return this.perform("compact", req);
  }
}
