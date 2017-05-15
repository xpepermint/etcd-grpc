import { Duplex } from "stream";

import { Client } from "./client";
import { normalizeKeys } from "object-keys-normalizer";
import { IWatchCreateRequest, IWatchCancelRequest } from "./messages";

/**
 * Etcd watcher class
 */
export class WatchClient extends Client {
  /**
   * Stream watcher to listen for changes.
   */
  protected stream: Duplex;
  /**
   * Watch identifier.
   */
  protected watchId: string = "0";
  /**
   * Watch indicator.
   */
  protected watching: boolean = false;

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
    super("Watch", { endpoints, connect });
  }

  /**
   * Opens connections for all supported services.
   */
  public connect() {
    if (this.client) { return; }

    super.connect();

    function emitEvent(name, res) {
      let data = normalizeKeys(res, "camel");
      this.emit(name, data);
    }

    this.stream = this.client.watch();
    this.stream.on("data", (res) => emitEvent.call(this, "data", res));
    this.stream.on("finish", (res) => emitEvent.call(this, "finish", res));
    this.stream.on("end", (res) => emitEvent.call(this, "end", res));
    this.stream.on("close", (res) => emitEvent.call(this, "close", res));
    this.stream.on("error", (res) => emitEvent.call(this, "error", res));
  }

  /**
   * Closes connections for all supported services.
   */
  public close() {
    if (!this.client) { return; }

    this.stream.end();
    super.close();
  }

  /**
   * Starts listening for changes.
   */
  public watch(req?: IWatchCreateRequest) {
    if (this.watching) { return; }

    this.watching = true;
    this.watchId = (parseInt(this.watchId) + 1).toString();

    const data = normalizeKeys({
      createRequest: req,
    }, "snake");
    this.stream.write(data);
  }

  /**
   * Stops listening for changes but stays connected.
   */
  public cancel() {
    if (!this.watching) { return; }

    this.watching = false;

    const data = normalizeKeys({
      cancelRequest: { watchId: this.watchId } as IWatchCancelRequest,
    }, "snake");
    this.stream.write(data);
  }

  /**
   * Returns true if the stream is listening for changes.
   */
  public isWatching() {
    return this.watching;
  }
}