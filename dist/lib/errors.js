"use strict";
exports.__esModule = true;
var ErrorKind;
(function (ErrorKind) {
    ErrorKind[ErrorKind["UNKNOWN"] = 0] = "UNKNOWN";
    ErrorKind[ErrorKind["CONNECTION_FAILED"] = 1] = "CONNECTION_FAILED";
    ErrorKind[ErrorKind["COMMAND_CANCELED"] = 2] = "COMMAND_CANCELED";
})(ErrorKind = exports.ErrorKind || (exports.ErrorKind = {}));
function getErrorKind(err) {
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
exports.getErrorKind = getErrorKind;
//# sourceMappingURL=errors.js.map