/// <reference types="node" />
import { Duplex } from "stream";
import { Client, IEvent, IResponseHeader } from "./client";
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
export interface IWatchCancelRequest {
    watchId: number | string;
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
    close(): void;
    watch(req?: IWatchCreateRequest): void;
    cancel(): void;
    isWatching(): boolean;
}
