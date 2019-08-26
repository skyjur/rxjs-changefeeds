"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var utils_1 = require("../utils");
exports.feedToKeyValueMap = function () { return function (source) {
    return new rxjs_1.Observable(function (subscriber) {
        var data = new Map();
        var subscription = source.subscribe({
            next: utils_1.changeFeedHandler({
                set: function (key, value) {
                    if (data.get(key) !== value) {
                        data.set(key, value);
                        subscriber.next(data);
                    }
                },
                del: function (key) {
                    if (data.has(key)) {
                        data.delete(key);
                        subscriber.next(data);
                    }
                }
            }),
            complete: function () {
                subscriber.complete();
            },
            error: function (e) {
                subscriber.error(e);
            }
        });
        return function () {
            subscription.unsubscribe();
        };
    });
}; };
