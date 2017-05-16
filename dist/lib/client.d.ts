/// <reference types="node" />
import { EventEmitter } from "events";
export declare const PUT_EVENT_TYPE = 0;
export declare const DELETE_EVENT_TYPE = 1;
export interface IKeyValue {
    key: Buffer;
    createRevision: number;
    modRevision: number;
    version: string;
    value: Buffer;
    lease: string;
}
export interface IEvent {
    type: 0 | 1;
    kv: IKeyValue;
    prevKv: IKeyValue;
}
export interface IResponseHeader {
    clusterId: string;
    memberId: string;
    revision: string;
    raftTerm: string;
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
