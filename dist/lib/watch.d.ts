/// <reference types="node" />
import { Duplex } from "stream";
import { Client, IEvent, IResponseHeader } from "./client";
export interface IWatchCreateRequest {
    key?: Buffer;
    rangeEnd?: Buffer;
    startRevision?: string;
    progressNotify?: boolean;
}
export interface IWatchCancelRequest {
    watchId: string;
}
export interface IWatchResponse {
    header: IResponseHeader;
    watchId: string;
    created: boolean;
    canceled: boolean;
    compactRevision: string;
    events: IEvent[];
}
export declare class WatchClient extends Client {
    protected stream: Duplex;
    protected watchId: string;
    protected watching: boolean;
    constructor({endpoints, connect}?: {
        endpoints?: string[];
        connect?: boolean;
    });
    connect(): void;
    close(): void;
    watch(req?: IWatchCreateRequest): void;
    cancel(): void;
    isWatching(): boolean;
}
