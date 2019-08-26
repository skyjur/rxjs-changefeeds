"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var utils_1 = require("../utils");
function feedCount(feed) {
    return new rxjs_1.Observable(function (subscriber) {
        var keys = new Set();
        var sub = feed.subscribe({
            next: utils_1.changeFeedHandler({
                initializing: function () {
                    // do nothing
                },
                ready: function () {
                    // do nothing
                },
                set: function (key, _value) {
                    if (!keys.has(key)) {
                        keys.add(key);
                        subscriber.next(keys.size);
                    }
                },
                del: function (key) {
                    if (keys.has(key)) {
                        keys.delete(key);
                        subscriber.next(keys.size);
                    }
                }
            })
        });
        return function () {
            sub.unsubscribe();
        };
    });
}
exports.feedCount = feedCount;
