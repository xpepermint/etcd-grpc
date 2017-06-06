import { EventEmitter } from "events";
import { Duplex } from "stream";
import { IEvent, IResponseHeader } from "./rpc";
import * as grpc from "grpc";
import * as incstr from "incstr";

/**
 * Available server events filters.
 */
export enum FilterType {
  /**
   * Filter out put event.
   */
  NOPUT = 0,
  /**
   * Filter out delete event.
   */
  NODELETE = 1,
}

/**
 * Create watcher request interface.
 */
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
  startRevision?: number | string;
  /**
   * If set then the etcd server will periodically send a IWatchResponse with no
   * events to the new watcher if there are no recent events. It is useful when
   * clients wish to recover a disconnected watcher starting from a recent known
   * revision. The etcd server may decide how often it will send notifications
   * based on current load.
   */
  progressNotify?: boolean;
  /**
   * Filter the events at server side before it sends back to the watcher.
   */
  filters?: FilterType[];
  /**
   * If set, created watcher gets the previous KV before the event happens. If
   * the previous KV is already compacted, nothing will be returned.
   */
  prevKv?: boolean;
}

/**
 * Watcher response interface.
 */
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

/**
 * Watcher class to listen for changes.
 */
export class Watcher extends EventEmitter {
  /**
   * Stream watcher to listen for changes.
   */
  protected stream: Duplex;
  /**
   * Watch client instance.
   */
  protected client: any;

  /**
   * Class constructor.
   */
  public constructor(client) {
    super();

    this.client = client;
  }

  /**
   * Starts listening for changes.
   */
  public watch(req?: IWatchCreateRequest) {
    if (this.stream) {
      this.close();
    }

    this.stream = this.client.watchClient.watch();
    this.stream.on("data", (res) => {
      this.emit("data", this.client.normalizeResponseObject(res));
    });
    this.stream.on("finish", (res) => {
      this.emit("finish", this.client.normalizeResponseObject(res));
    });
    this.stream.on("end", (res) => {
      this.emit("end", this.client.normalizeResponseObject(res));
    });
    this.stream.on("close", (res) => {
      this.emit("close", this.client.normalizeResponseObject(res));
    });
    this.stream.on("error", (err) => {
      this.emit("error", this.client.normalizeResponseObject(err));
    });

    this.stream.write(
      this.client.normalizeRequestObject({
        createRequest: req,
      })
    );
  }

  /**
   * Closes connections for all supported clients.
   */
  public close() {
    if (!this.stream) { return; }

    this.stream.removeAllListeners(); // detach listeners
    this.stream.once("error", () => {}); // ignore errors (client is almost closed)
    this.stream.end(); // end stream
    this.stream = null;
  }

  /**
   * Returns true if the stream is listening for changes.
   */
  public isWatching() {
    return !!this.stream;
  }
}
