"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
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
function feedFilter(predicate) {
    var predicate$ = typeof predicate === "function" ? rxjs_1.of(predicate) : predicate;
    return function (feed) {
        return new rxjs_1.Observable(function (subscriber) {
            var excluded = new Map();
            var included = new Map();
            var predicate = function (_val) { return false; };
            var predicateSub = predicate$.subscribe({
                next: function (newPredicate) {
                    var e_1, _a, e_2, _b;
                    predicate = newPredicate;
                    var toBeExcluded = Array.from(included.entries()).filter(function (_a) {
                        var _b = __read(_a, 2), value = _b[1];
                        return !predicate(value);
                    });
                    var toBeIncluded = Array.from(excluded.entries()).filter(function (_a) {
                        var _b = __read(_a, 2), value = _b[1];
                        return predicate(value);
                    });
                    try {
                        for (var toBeExcluded_1 = __values(toBeExcluded), toBeExcluded_1_1 = toBeExcluded_1.next(); !toBeExcluded_1_1.done; toBeExcluded_1_1 = toBeExcluded_1.next()) {
                            var _c = __read(toBeExcluded_1_1.value, 2), key = _c[0], value = _c[1];
                            excluded.set(key, value);
                            included.delete(key);
                            subscriber.next(["del", key]);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (toBeExcluded_1_1 && !toBeExcluded_1_1.done && (_a = toBeExcluded_1.return)) _a.call(toBeExcluded_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    try {
                        for (var toBeIncluded_1 = __values(toBeIncluded), toBeIncluded_1_1 = toBeIncluded_1.next(); !toBeIncluded_1_1.done; toBeIncluded_1_1 = toBeIncluded_1.next()) {
                            var _d = __read(toBeIncluded_1_1.value, 2), key = _d[0], value = _d[1];
                            included.set(key, value);
                            excluded.delete(key);
                            subscriber.next(["set", key, value]);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (toBeIncluded_1_1 && !toBeIncluded_1_1.done && (_b = toBeIncluded_1.return)) _b.call(toBeIncluded_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                },
                error: function (e) {
                    console.error(e);
                }
            });
            var feedSub = feed.subscribe({
                next: utils_1.changeFeedHandler({
                    initializing: function () {
                        included.clear();
                        excluded.clear();
                        subscriber.next(["initializing"]);
                    },
                    ready: function () {
                        subscriber.next(["ready"]);
                    },
                    set: function (key, value) {
                        if (predicate(value)) {
                            included.set(key, value);
                            if (excluded.has(key)) {
                                excluded.delete(key);
                            }
                            subscriber.next(["set", key, value]);
                        }
                        else {
                            excluded.set(key, value);
                            if (included.has(key)) {
                                included.delete(key);
                                subscriber.next(["del", key]);
                            }
                        }
                    },
                    del: function (key) {
                        if (excluded.has(key)) {
                            excluded.delete(key);
                        }
                        if (included.has(key)) {
                            included.delete(key);
                            subscriber.next(["del", key]);
                        }
                    }
                }),
                complete: function () {
                    subscriber.complete();
                    predicateSub.unsubscribe();
                },
                error: function (error) {
                    subscriber.error(error);
                }
            });
            return function () {
                predicateSub.unsubscribe();
                feedSub.unsubscribe();
            };
        });
    };
}
exports.feedFilter = feedFilter;
