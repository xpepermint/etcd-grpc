import { IResponseHeader } from "./client";
import { Client } from "./client";

/**
 * Grant lease request interface.
 */
export interface ILeaseGrantRequest {
  /**
   * The advisory time-to-live in seconds.
   */
  ttl?: string | number;
  /**
   * The requested ID for the lease. If ID is set to 0, the lessor chooses an ID.
   */
  id?: string | number;
}

/**
 * Grant lease response interface.
 */
export interface ILeaseGrantResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
  /**
   * The lease ID for the granted lease.
   */
  id: string;
  /**
   * the server chosen lease time-to-live in seconds.
   */
  ttl: string;
  /**
   * Error message.
   */
  error: string;
}

/**
 * Revoke lease request interface.
 */
export interface ILeaseRevokeRequest {
  /**
   * The lease ID to revoke. When the ID is revoked, all associated keys will be deleted.
   */
  id?: string | number;
}

/**
 * Revoke lease response interface.
 */
export interface ILeaseRevokeResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
}

/**
 * KeepAlive lease request interface.
 */
export interface ILeaseKeepAliveRequest {
  /**
   * The lease ID for the lease to keep alive.
   */
  id?: string | number;
}

/**
 * KeepAlive lease response interface.
 */
export interface ILeaseKeepAliveResponse {
  /**
   * Request metadata.
   */
  header: IResponseHeader;
  /**
   * The lease ID from the keep alive request.
   */
  id: string | number;
  /**
   * The new time-to-live for the lease.
   */
  ttl: string;
}

/**
 * TTL manager class.
 */
export class LeaseClient extends Client {
  /**
   * Class constructor.
   */
  public constructor({
    endpoints = ["127.0.0.1:2379"],
    connect = true,
  }: {
    endpoints?: string[];
    connect?: boolean;
  } = {}) {
    super("Lease", { endpoints, connect });
  }

  /**
   * Creates a lease which expires if the server does not receive a keepAlive within a given time
   * to live period. All keys attached to the lease will be expired and deleted if the lease
   * expires. Each expired key generates a delete event in the event history.
   */
  public leaseGrant(req: ILeaseGrantRequest): Promise<ILeaseGrantResponse> {
    return this.perform("leaseGrant", req);
  }

  /**
   * Revokes a lease. All keys attached to the lease will expire and be deleted.
   */
  public leaseRevoke(req: ILeaseRevokeRequest): Promise<ILeaseRevokeResponse> {
    return this.perform("leaseRevoke", req);
  }
}
