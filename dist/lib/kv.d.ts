import { IRangeRequest, IRangeResponse, IPutRequest, IPutResponse, IDeleteRangeRequest, IDeleteRangeResponse } from "./messages";
import { Client } from "./client";
export declare class KVClient extends Client {
    constructor({endpoints, connect}?: {
        endpoints?: string[];
        connect?: boolean;
    });
    range(req: IRangeRequest): Promise<IRangeResponse>;
    put(req: IPutRequest): Promise<IPutResponse>;
    deleteRange(req: IDeleteRangeRequest): Promise<IDeleteRangeResponse>;
}
