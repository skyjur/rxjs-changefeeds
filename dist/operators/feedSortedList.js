"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var utils_1 = require("../utils");
var ValueObservable = /** @class */ (function (_super) {
    __extends(ValueObservable, _super);
    function ValueObservable(key, subject) {
        var _this = _super.call(this, function (subscriber) {
            var sub = subject.subscribe(subscriber);
            return function () {
                sub.unsubscribe();
            };
        }) || this;
        _this.key = key;
        return _this;
    }
    return ValueObservable;
}(rxjs_1.Observable));
exports.ValueObservable = ValueObservable;
exports.feedSortedList = function (comparator, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.throttleTime, throttleTime = _c === void 0 ? 100 : _c, _d = _b.scheduler, scheduler = _d === void 0 ? rxjs_1.asyncScheduler : _d;
    return function (input) {
        return new rxjs_1.Observable(function (subscriber) {
            var data = new Map();
            var cmp = typeof comparator === "function" ? comparator : null;
            var keySortIndex = new Map();
            var sortedKeys = [];
            var pendingFlush = null;
            var flush = function () {
                pendingFlush = null;
                var keys = Array.from(data.keys());
                sortedKeys = keys.sort(function (key1, key2) {
                    return cmp(data.get(key1).value, data.get(key2).value);
                });
                keySortIndex = new Map(sortedKeys.map(function (key, index) { return [key, index]; }));
                subscriber.next(sortedKeys.map(function (key) { return data.get(key).observable; }));
            };
            var scheduleFlush = function () {
                if (!pendingFlush) {
                    if (throttleTime === null) {
                        flush();
                    }
                    else {
                        pendingFlush = scheduler.schedule(flush, throttleTime);
                    }
                }
            };
            var cmpSub = typeof comparator !== "function" &&
                comparator.subscribe({
                    next: function (newCmp) {
                        if (newCmp !== cmp) {
                            cmp = newCmp;
                            scheduleFlush();
                        }
                    }
                });
            var sub = input.subscribe({
                next: utils_1.changeFeedHandler({
                    set: function (key, newValue) {
                        if (data.has(key)) {
                            data.get(key).subject.next(newValue);
                            if (cmp && !pendingFlush) {
                                var i = keySortIndex.get(key);
                                if (i > 0) {
                                    var valueLeft = data.get(sortedKeys[i - 1]).value;
                                    if (cmp(valueLeft, newValue) > 0) {
                                        scheduleFlush();
                                    }
                                }
                                if (i < sortedKeys.length - 1) {
                                    var valueRight = data.get(sortedKeys[i + 1]).value;
                                    if (cmp(newValue, valueRight) > 0) {
                                        scheduleFlush();
                                    }
                                }
                            }
                        }
                        else {
                            var subject = new rxjs_1.BehaviorSubject(newValue);
                            var observable = new ValueObservable(key, subject);
                            data.set(key, { value: newValue, subject: subject, observable: observable });
                            scheduleFlush();
                        }
                    },
                    del: function (key) {
                        if (data.has(key)) {
                            data.get(key).subject.complete();
                            data.delete(key);
                            scheduleFlush();
                        }
                    }
                }),
                error: function (e) {
                    subscriber.error(e);
                },
                complete: function () {
                    var e_1, _a;
                    subscriber.complete();
                    try {
                        for (var _b = __values(data.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var subject = _c.value.subject;
                            subject.complete();
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
            });
            return function () {
                var e_2, _a;
                sub.unsubscribe();
                cmpSub && cmpSub.unsubscribe();
                if (pendingFlush) {
                    pendingFlush.unsubscribe();
                }
                try {
                    for (var _b = __values(data.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var subject = _c.value.subject;
                        subject.complete();
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            };
        });
    };
};
