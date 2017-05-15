/// <reference types="node" />
export interface IRangeRequest {
    key: Buffer;
    rangeEnd?: Buffer;
    limit?: number;
    revision?: number;
    sortOrder?: 0 | 1 | 2;
    sortTarget?: 0 | 1 | 2 | 3 | 4;
    serializable?: boolean;
    keysOnly?: boolean;
    countOnly?: boolean;
}
export interface IResponseHeader {
    clusterId: string;
    memberId: string;
    revision: string;
    raftTerm: string;
}
export interface IRangeResponse {
    header: IResponseHeader;
    kvs: IKeyValue[];
    more: boolean;
    count: string;
}
export interface IPutRequest {
    key: Buffer;
    value: Buffer;
    lease?: string;
}
export interface IPutResponse {
    header: IResponseHeader;
}
export interface IDeleteRangeRequest {
    key: Buffer;
    rangeEnd?: Buffer;
}
export interface IDeleteRangeResponse {
    header: IResponseHeader;
    deleted: string;
}
export interface IWatchCreateRequest {
    key: Buffer;
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
