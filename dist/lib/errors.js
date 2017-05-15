"use strict";
exports.__esModule = true;
function getErrorKind(err) {
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
exports.getErrorKind = getErrorKind;
//# sourceMappingURL=errors.js.map