"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var utils_1 = require("../utils");
exports.feedToKeyValueObject = function () { return function (source) {
    return new rxjs_1.Observable(function (subscriber) {
        var data = {};
        var subscription = source.subscribe({
            next: utils_1.changeFeedHandler({
                set: function (key, value) {
                    if (data[key] !== value) {
                        data[key] = value;
                        subscriber.next(data);
                    }
                },
                del: function (key) {
                    if (key in data) {
                        delete data[key];
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
