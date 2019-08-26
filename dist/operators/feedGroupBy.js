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
var utils_1 = require("../utils");
var ChangeFeedReplay_1 = require("../ChangeFeedReplay");
exports.feedGroupBy = function (keySelector) {
    return function (input) {
        return new rxjs_1.Observable(function (subscriber) {
            var groups = new Map();
            var recordToGroupMap = new Map();
            var groupContent = new Map();
            var ready = false;
            var initializing = false;
            var sub = input.subscribe({
                next: utils_1.changeFeedHandler({
                    initializing: function () {
                        initializing = true;
                        ready = false;
                        subscriber.next(["initializing"]);
                    },
                    ready: function () {
                        var e_1, _a;
                        ready = true;
                        initializing = false;
                        try {
                            for (var _b = __values(groups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var group = _c.value;
                                group.next(["ready"]);
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
                    set: function (key, value) {
                        var groupKey = keySelector(value);
                        if (recordToGroupMap.has(key) &&
                            recordToGroupMap.get(key) !== groupKey) {
                            this.del(key);
                        }
                        recordToGroupMap.set(key, groupKey);
                        if (!groups.has(groupKey)) {
                            var newGroup = new ChangeFeedReplay_1.ChangeFeedReplaySubject();
                            groups.set(groupKey, newGroup);
                            groupContent.set(groupKey, new Set());
                            subscriber.next(["set", groupKey, newGroup]);
                            if (initializing) {
                                newGroup.next(["initializing"]);
                            }
                        }
                        groupContent.get(groupKey).add(key);
                        groups.get(groupKey).next(["set", key, value]);
                    },
                    del: function (key) {
                        if (recordToGroupMap.has(key)) {
                            var groupKey = recordToGroupMap.get(key);
                            if (groups.has(groupKey)) {
                                var group = groups.get(groupKey);
                                var trackedKeys = groupContent.get(groupKey);
                                if (trackedKeys.has(key)) {
                                    trackedKeys.delete(key);
                                    group.next(["del", key]);
                                    if (trackedKeys.size === 0) {
                                        groups.delete(groupKey);
                                        groupContent.delete(groupKey);
                                        group.complete();
                                        subscriber.next(["del", groupKey]);
                                    }
                                }
                            }
                        }
                    }
                }),
                complete: function () {
                    var e_2, _a;
                    subscriber.complete();
                    try {
                        for (var _b = __values(groups.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var group = _c.value;
                            group.complete();
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                },
                error: function (e) {
                    subscriber.error(e);
                }
            });
            return function () {
                sub.unsubscribe();
            };
        });
    };
};
