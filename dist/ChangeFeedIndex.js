"use strict";
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
var utils_1 = require("./utils");
/**
 * Index last value in changefeed by key into BehaviorSubject
 */
var ChangeFeedIndex = /** @class */ (function () {
    function ChangeFeedIndex(scheduler) {
        var _this = this;
        if (scheduler === void 0) { scheduler = rxjs_1.asyncScheduler; }
        this.scheduler = scheduler;
        this.state = new Map();
        this.subscribers = new Map();
        this.closed = false;
        this.isReady = false;
        this.next = utils_1.changeFeedHandler({
            initializing: function () {
                _this.state.clear();
                _this.isReady = false;
            },
            ready: function () {
                _this.isReady = true;
                _this.subscribers.forEach(function (subscribers, key) {
                    if (!_this.state.has(key)) {
                        subscribers.forEach(function (subscriber) {
                            _this.scheduler.schedule(function () {
                                subscriber.next(null);
                            });
                        });
                    }
                });
            },
            set: function (key, value) {
                var e_1, _a;
                _this.state.set(key, value);
                var _loop_1 = function (subscriber) {
                    _this.scheduler.schedule(function () {
                        subscriber.next(value);
                    });
                };
                try {
                    for (var _b = __values(_this.subscribers.get(key) || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var subscriber = _c.value;
                        _loop_1(subscriber);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            },
            del: function (key) {
                var e_2, _a;
                _this.state.delete(key);
                var _loop_2 = function (subscriber) {
                    _this.scheduler.schedule(function () {
                        subscriber.next(null);
                    });
                };
                try {
                    for (var _b = __values(_this.subscribers.get(key) || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var subscriber = _c.value;
                        _loop_2(subscriber);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        });
    }
    ChangeFeedIndex.prototype.get = function (key) {
        var _this = this;
        return new rxjs_1.Observable(function (subscriber) {
            if (_this.state.has(key)) {
                _this.scheduler.schedule(function () {
                    subscriber.next(_this.state.get(key));
                });
            }
            else if (_this.isReady) {
                _this.scheduler.schedule(function () {
                    subscriber.next(null);
                });
            }
            if (!_this.subscribers.has(key)) {
                _this.subscribers.set(key, []);
            }
            _this.subscribers.get(key).push(subscriber);
            return function () {
                var subscribers = _this.subscribers.get(key) || [];
                var index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                    if (subscribers.length === 0) {
                        _this.subscribers.delete(key);
                    }
                }
            };
        });
    };
    ChangeFeedIndex.prototype.complete = function () {
        this.unsubscribe();
    };
    ChangeFeedIndex.prototype.unsubscribe = function () {
        var _this = this;
        this.subscribers.forEach(function (subscribers) {
            return subscribers.forEach(function (subscriber) {
                _this.scheduler.schedule(function () {
                    subscriber.complete();
                });
            });
        });
        this.closed = true;
        this.next = function () { return null; };
        this.state.clear();
        this.subscribers.clear();
    };
    return ChangeFeedIndex;
}());
exports.ChangeFeedIndex = ChangeFeedIndex;
