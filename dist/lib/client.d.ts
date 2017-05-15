/// <reference types="node" />
import { EventEmitter } from "events";
export declare const PROTO_FILE_PATH: string;
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
    isConnected(): boolean;
}
