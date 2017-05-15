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

export interface IResponseHeader {
  /**
   * The ID of the cluster which sent the response.
   */
  clusterId: string;
  /**
   * The ID of the member which sent the response.
   */
  memberId: string;
  /**
   * The key-value store revision when the request was applied.
   */
  revision: string;
  /**
   * The raft term when the request was applied.
   */
  raftTerm: string;
}

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

export interface IPutResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
}

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

export interface IWatchCreateRequest {
  /**
   * The key to register for watching.
   */
  key?: Buffer;
  /**
   * The end of the range [key, rangeEnd) to watch. If rangeEnd is not
   * given, only the key argument is watched. If rangeEnd is equal to '\0',
   * all keys greater than or equal to the key argument are watched.
   */
  rangeEnd?: Buffer;
  /**
   * An optional revision to watch from (inclusive). No startRevision is "now".
   */
  startRevision?: string;
  /**
   * If set then the etcd server will periodically send a IWatchResponse with no
   * events to the new watcher if there are no recent events. It is useful when
   * clients wish to recover a disconnected watcher starting from a recent known
   * revision. The etcd server may decide how often it will send notifications
   * based on current load.
   */
  progressNotify?: boolean;
}

export interface IWatchCancelRequest {
  /**
   * The watcher id to cancel so that no more events are transmitted.
   */
  watchId: string;
}

export interface IWatchResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
  /**
   * Is the ID of the watcher that corresponds to the response.
   */
  watchId: string;
  /**
   * If set to true then the response is for a create watch request. The client
   * should record the watch_id and expect to receive events for the created watcher
   * from the same stream. All events sent to the created watcher will attach with
   * the same watch_id.
   */
  created: boolean;
  /**
   * If is set to true then the response is for a cancel watch request. No further
   * events will be sent to the canceled watcher.
   */
  canceled: boolean;
  /**
   * It is set to the minimum index if a watcher tries to watch at a compacted index.
   * This happens when creating a watcher at a compacted revision or the watcher cannot
   * catch up with the progress of the key-value store. The client should treat the
   * watcher as canceled and should not try to create any watcher with the same
   * startRevision again.
   */
  compactRevision: string;
  /**
   * Events.
   */
  events: IEvent[];
}

export interface IKeyValue {
  /**
   * The key in bytes. An empty key is not allowed.
   */
  key: Buffer;
  /**
   * The revision of last creation on this key.
   */
  createRevision: number;
  /**
   * The revision of last modification on this key.
   */
  modRevision: number;
  /**
   * The version of the key. A deletion resets the version
   * to zero and any modification of the key increases its version.
   */
  version: string;
  /**
   * The value held by the key, in bytes.
   */
  value: Buffer;
  /**
   * The ID of the lease that attached to key. When the attached lease
   * expires, the key will be deleted. If lease is 0, then no lease is
   * attached to the key.
   */
  lease: string;
}

export interface IEvent {
  /**
   * The kind of event. If type is a PUT, it indicates new data has been stored to the
   * key. If type is a DELETE, it indicates the key was deleted.
   */
  type: 0 | 1;
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

export interface ICompactionResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
}
