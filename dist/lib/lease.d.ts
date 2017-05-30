import { IResponseHeader } from "./client";
import { Client } from "./client";
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
export declare class LeaseClient extends Client {
    constructor({endpoints, connect}?: {
        endpoints?: string[];
        connect?: boolean;
    });
    leaseGrant(req: ILeaseGrantRequest): Promise<ILeaseGrantResponse>;
    leaseRevoke(req: ILeaseRevokeRequest): Promise<ILeaseRevokeResponse>;
}
