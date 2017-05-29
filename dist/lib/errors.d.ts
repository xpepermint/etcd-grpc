export declare enum ErrorKind {
    UNKNOWN = 0,
    CONNECTION_FAILED = 1,
    COMMAND_CANCELED = 2,
}
export declare function getErrorKind(err: Error): 0 | 1 | 2;
