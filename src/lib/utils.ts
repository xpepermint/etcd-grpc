/**
 * Returns the kind of the provided error.
 */
export function getErrorKind(err: Error) {
  switch (err.message) {
    case "Connect Failed":
    case "Failed to create subchannel":
      return "CONNECTION_FAILED";
    case "Cancelled":
      return "COMMAND_CANCELED";
    default:
      return null;
  }
}
