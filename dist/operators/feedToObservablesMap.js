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
function feedToObservablesMap() {
    return function (input) {
        return new rxjs_1.Observable(function (subscriber) {
            var acc = new FeedToMapAccumulator(subscriber);
            var sub = input.subscribe({
                next: function (record) {
                    acc.next(record);
                },
                complete: function () {
                    acc.complete();
                    subscriber.complete();
                },
                error: function (error) {
                    subscriber.error(error);
                }
            });
            return function () {
                sub.unsubscribe();
            };
        });
    };
}
exports.feedToObservablesMap = feedToObservablesMap;
var FeedToMapAccumulator = /** @class */ (function () {
    function FeedToMapAccumulator(output) {
        this.output = output;
        this.keysHasChanged = false;
        this.data = new Map();
    }
    FeedToMapAccumulator.prototype.next = function (val) {
        switch (val[0]) {
            case "initializing":
                this.data.clear();
                this.postMapUpdate();
                break;
            case "ready":
                break;
            case "set":
                this.set(val[1], val[2]);
                break;
            case "del":
                this.del(val[1]);
                break;
        }
    };
    FeedToMapAccumulator.prototype.complete = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.data.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var s = _c.value;
                s.complete();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    FeedToMapAccumulator.prototype.set = function (key, obj) {
        if (this.data.has(key)) {
            this.data.get(key).next(obj);
        }
        else {
            this.data.set(key, new rxjs_1.BehaviorSubject(obj));
            this.postMapUpdate();
        }
    };
    FeedToMapAccumulator.prototype.del = function (key) {
        if (this.data.has(key)) {
            this.data.get(key).complete();
            this.data.delete(key);
            this.postMapUpdate();
        }
    };
    FeedToMapAccumulator.prototype.postMapUpdate = function () {
        this.output.next(this.data);
    };
    return FeedToMapAccumulator;
}());
