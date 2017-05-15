import { IRangeRequest, IRangeResponse, IPutRequest, IPutResponse, IDeleteRangeRequest,
  IDeleteRangeResponse, ICompactionRequest, ICompactionResponse } from "./messages";
import { Client } from "./client";

/**
 * KV client class.
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
