/// <reference types="node" />
import { EventEmitter } from "events";
import { Duplex } from "stream";
import { IEvent, IResponseHeader } from "./rpc";
export declare enum FilterType {
    NOPUT = 0,
    NODELETE = 1,
}
export interface IWatchCreateRequest {
    key?: Buffer;
    rangeEnd?: Buffer;
    startRevision?: number | string;
    progressNotify?: boolean;
    filters?: FilterType[];
    prevKv?: boolean;
}
export interface IWatchResponse {
    header: IResponseHeader;
    watchId: string;
    created: boolean;
    canceled: boolean;
    compactRevision: string;
    events: IEvent[];
}
export declare class Watcher extends EventEmitter {
    protected stream: Duplex;
    protected client: any;
    constructor(client: any);
    watch(req?: IWatchCreateRequest): void;
    close(): void;
    isWatching(): boolean;
}
