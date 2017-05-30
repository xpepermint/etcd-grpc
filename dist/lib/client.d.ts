/// <reference types="node" />
import { EventEmitter } from "events";
export interface IKeyValue {
    key: Buffer;
    createRevision: number | string;
    modRevision: number | string;
    version: number | string;
    value: Buffer;
    lease: number | string;
}
export declare enum EventType {
    PUT = 0,
    DELETE = 1,
}
export interface IEvent {
    type: EventType;
    kv: IKeyValue;
    prevKv: IKeyValue;
}
export interface IResponseHeader {
    clusterId: number | string;
    memberId: number | string;
    revision: number | string;
    raftTerm: number | string;
}
export declare abstract class Client extends EventEmitter {
    protected rpc: any;
    protected client: any;
    protected service: any;
    endpoints: string[];
    constructor(service: string, {endpoints, connect}?: {
        endpoints?: string[];
        connect?: boolean;
    });
    connect(): void;
    close(): void;
    reconnect(): void;
    protected perform(command: string, req: any): Promise<{}>;
    protected normalizeRequestObject(req: any): any;
    protected normalizeResponseObject(req: any): any;
    isConnected(): boolean;
}
