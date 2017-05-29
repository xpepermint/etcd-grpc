/**
 * Known error messages.
 */
export enum ErrorKind {
  /**
   * Unknown error.
   */
  UNKNOWN = 0,
  /**
   * Connection problem.
   */
  CONNECTION_FAILED = 1,
  /**
   * Command canceled.
   */
  COMMAND_CANCELED = 2,
}

/**
 * Returns the kind of the provided error.
 */
export function getErrorKind(err: Error) {
  switch (err.message) {
    case "Connect Failed":
    case "Failed to create subchannel":
      return 1;
    case "Cancelled":
      return 2;
    default:
      return 0;
  }
}
