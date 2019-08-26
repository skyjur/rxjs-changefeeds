"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var operators_1 = require("rxjs/operators");
exports.feedMapValues = function (p) {
    return operators_1.map(function (record) {
        if (record[0] === "set") {
            return ["set", record[1], p(record[2])];
        }
        else {
            return record;
        }
    });
};
