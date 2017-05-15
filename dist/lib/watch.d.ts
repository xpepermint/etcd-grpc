/// <reference types="node" />
import { Duplex } from "stream";
import { Client } from "./client";
import { IWatchCreateRequest } from "./messages";
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
