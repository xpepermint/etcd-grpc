/// <reference types="node" />
import { Client, IKeyValue, IResponseHeader } from "./client";
export declare const EDGE_KEY = "\0";
export declare const NONE_SORT_ORDER = 0;
export declare const ASCEND_SORT_ORDER = 1;
export declare const DESCEND_SORT_ORDER = 2;
export declare const KEY_SORT_TARGET = 0;
export declare const VERSION_SORT_TARGET = 1;
export declare const CREATE_SORT_TARGET = 2;
export declare const MOD_SORT_TARGET = 3;
export declare const VALUE_SORT_TARGET = 4;
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
export interface ICompactionRequest {
    revision?: string | number;
    physical?: boolean;
}
export interface ICompactionResponse {
    header: IResponseHeader;
}
export declare class KVClient extends Client {
    constructor({endpoints, connect}?: {
        endpoints?: string[];
        connect?: boolean;
    });
    range(req: IRangeRequest): Promise<IRangeResponse>;
    put(req: IPutRequest): Promise<IPutResponse>;
    deleteRange(req: IDeleteRangeRequest): Promise<IDeleteRangeResponse>;
    compact(req: ICompactionRequest): Promise<ICompactionResponse>;
}
