"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function changeFeedHandler(handler) {
    return function (record) {
        switch (record[0]) {
            case "initializing":
                handler.initializing && handler.initializing();
                break;
            case "ready":
                handler.ready && handler.ready();
                break;
            case "set":
                handler.set && handler.set(record[1], record[2]);
                break;
            case "del":
                handler.del && handler.del(record[1]);
                break;
            default:
                throw new Error("Invalid changefeed operation: " + record[0]);
        }
    };
}
exports.changeFeedHandler = changeFeedHandler;
