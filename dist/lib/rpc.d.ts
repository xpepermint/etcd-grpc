/// <reference types="node" />
import { Watcher } from "./watch";
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
export declare enum SortOrder {
    NONE = 0,
    ASCEND = 1,
    DESCEND = 2,
}
export declare enum SortTarget {
    KEY = 0,
    VERSION = 1,
    CREATE = 2,
    MOD = 3,
    VALUE = 4,
}
export interface IRangeRequest {
    key: Buffer;
    rangeEnd?: Buffer;
    limit?: number | string;
    revision?: number | string;
    sortOrder?: SortOrder;
    sortTarget?: SortTarget;
    serializable?: boolean;
    keysOnly?: boolean;
    countOnly?: boolean;
    minModRevision?: number | string;
    maxModRevision?: number | string;
    minCreateRevision?: number | string;
    maxCreateRevision?: number | string;
}
export interface IRangeResponse {
    header: IResponseHeader;
    kvs: IKeyValue[];
    more: boolean;
    count: number | string;
}
export interface IPutRequest {
    key: Buffer;
    value: Buffer;
    lease?: number | string;
    prevKv?: boolean;
    ignoreValue?: boolean;
    ignoreLease?: boolean;
}
export interface IPutResponse {
    header: IResponseHeader;
}
export interface IDeleteRangeRequest {
    key: Buffer;
    rangeEnd?: Buffer;
    prevKv?: boolean;
}
export interface IDeleteRangeResponse {
    header: IResponseHeader;
    deleted: number | string;
}
export interface ICompactionRequest {
    revision?: number | string;
    physical?: boolean;
}
export interface ICompactionResponse {
    header: IResponseHeader;
}
export interface ITxnRequest {
    compare: ICompare | ICompare[];
    success: IRequestOp | IRequestOp[];
    failure: IRequestOp | IRequestOp[];
}
export interface ITxnResponse {
    header: IResponseHeader;
    succeeded: boolean;
    responses: IResponseOp[];
}
export interface IRequestOp {
    requestRange?: IRangeRequest;
    requestPut?: IPutRequest;
    requestDeleteRange?: IDeleteRangeRequest;
}
export interface IResponseOp {
    responseRange: IRangeResponse;
    responsePut: IPutResponse;
    responseDeleteRange: IDeleteRangeResponse;
}
export declare enum CompareResult {
    EQUAL = 0,
    GREATER = 1,
    LESS = 2,
    NOT_EQUAL = 3,
}
export declare enum CompareTarget {
    VERSION = 0,
    CREATE = 1,
    MOD = 2,
    VALUE = 3,
}
export interface ICompare {
    result?: CompareResult;
    target?: CompareTarget;
    key?: Buffer;
    version?: number | string;
    createRevision?: number | string;
    modRevision?: number | string;
    value?: Buffer;
}
export interface ILeaseGrantRequest {
    ttl?: number | string;
    id?: number | string;
}
export interface ILeaseGrantResponse {
    header: IResponseHeader;
    id: number | string;
    ttl: number | string;
    error: string;
}
export interface ILeaseRevokeRequest {
    id?: number | string;
}
export interface ILeaseRevokeResponse {
    header: IResponseHeader;
}
export interface ILeaseKeepAliveRequest {
    id?: number | string;
}
export interface ILeaseKeepAliveResponse {
    header: IResponseHeader;
    id: number | string;
    ttl: number | string;
}
export declare class Etcd {
    readonly rpc: any;
    protected kvClient: any;
    protected leaseClient: any;
    protected watchClient: any;
    endpoints: string[];
    constructor({endpoints, connect}?: {
        endpoints?: string[];
        connect?: boolean;
    });
    connect(): void;
    close(): void;
    reconnect(): void;
    perform(service: any, command: string, req: any): Promise<any>;
    normalizeRequestObject(req: any): any;
    normalizeResponseObject(req: any): any;
    isConnected(): boolean;
    put(req: IPutRequest): Promise<IPutResponse>;
    range(req: IRangeRequest): Promise<IRangeResponse>;
    deleteRange(req: IDeleteRangeRequest): Promise<IDeleteRangeResponse>;
    txn(req: ITxnRequest): Promise<ITxnResponse>;
    compact(req?: ICompactionRequest): Promise<ICompactionResponse>;
    leaseGrant(req: ILeaseGrantRequest): Promise<ILeaseGrantResponse>;
    leaseRevoke(req: ILeaseRevokeRequest): Promise<ILeaseRevokeResponse>;
    createWatcher(): Watcher;
}
