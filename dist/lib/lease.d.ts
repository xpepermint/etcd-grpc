import { IResponseHeader } from "./client";
import { Client } from "./client";
export interface ILeaseGrantRequest {
    ttl?: string | number;
    id?: string | number;
}
export interface ILeaseGrantResponse {
    header: IResponseHeader;
    id: string;
    ttl: string;
    error: string;
}
export interface ILeaseRevokeRequest {
    id?: string | number;
}
export interface ILeaseRevokeResponse {
    header: IResponseHeader;
}
export interface ILeaseKeepAliveRequest {
    id?: string | number;
}
export interface ILeaseKeepAliveResponse {
    header: IResponseHeader;
    id: string | number;
    ttl: string;
}
export declare class LeaseClient extends Client {
    constructor({endpoints, connect}?: {
        endpoints?: string[];
        connect?: boolean;
    });
    leaseGrant(req: ILeaseGrantRequest): Promise<ILeaseGrantResponse>;
    leaseRevoke(req: ILeaseRevokeRequest): Promise<ILeaseRevokeResponse>;
}
