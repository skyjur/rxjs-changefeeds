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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
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
exports.feedCombine = function (feeds, project) {
    return new rxjs_1.Observable(function (subscriber) {
        var initializing = false;
        var readyAll = feeds.map(function () { return true; });
        var dataAll = feeds.map(function () { return new Map(); });
        var projectPublished = new Set();
        var subs = feeds.map(function (feed, index) {
            return feed.subscribe({
                next: utils_1.changeFeedHandler({
                    initializing: function () {
                        if (!initializing) {
                            initializing = true;
                            subscriber.next(["initializing"]);
                        }
                        readyAll[index] = false;
                    },
                    ready: function () {
                        initializing = false;
                        readyAll[index] = true;
                        if (readyAll.every(function (isReady) { return isReady; })) {
                            subscriber.next(["ready"]);
                        }
                    },
                    set: function (key, value) {
                        dataAll[index].set(key, value);
                        var combined = project.apply(void 0, __spread(dataAll.map(function (data) { return data.get(key); })));
                        if (combined) {
                            subscriber.next(["set", key, combined]);
                            projectPublished.add(key);
                        }
                        else {
                            if (projectPublished.has(key)) {
                                subscriber.next(["del", key]);
                                projectPublished.delete(key);
                            }
                        }
                    },
                    del: function (key) {
                        if (dataAll[index].has(key)) {
                            dataAll[index].delete(key);
                            if (dataAll.every(function (map) { return !map.has(key); })) {
                                if (projectPublished.has(key)) {
                                    subscriber.next(["del", key]);
                                    projectPublished.delete(key);
                                }
                            }
                            else {
                                var combined = project.apply(void 0, __spread(dataAll.map(function (data) { return data.get(key); })));
                                if (combined) {
                                    subscriber.next(["set", key, combined]);
                                    projectPublished.add(key);
                                }
                                else {
                                    if (projectPublished.has(key)) {
                                        subscriber.next(["del", key]);
                                        projectPublished.delete(key);
                                    }
                                }
                            }
                        }
                    }
                })
            });
        });
        return function () {
            var e_1, _a;
            try {
                for (var subs_1 = __values(subs), subs_1_1 = subs_1.next(); !subs_1_1.done; subs_1_1 = subs_1.next()) {
                    var sub = subs_1_1.value;
                    sub.unsubscribe();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (subs_1_1 && !subs_1_1.done && (_a = subs_1.return)) _a.call(subs_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
    });
};
