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
var utils_1 = require("./utils");
/**
 * Buffer feed and reply all objects to newly connected subscriber
 *
 * Following ReplySubject paradigm of rxjs
 *
 */
var ChangeFeedReplaySubject = /** @class */ (function (_super) {
    __extends(ChangeFeedReplaySubject, _super);
    function ChangeFeedReplaySubject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = new ChangeFeedRecorder();
        return _this;
    }
    ChangeFeedReplaySubject.prototype.next = function (record) {
        this.state.next(record);
        _super.prototype.next.call(this, record);
    };
    ChangeFeedReplaySubject.prototype._subscribe = function (subscriber) {
        // tslint:disable-next-line:deprecation
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        this.state.replay(subscriber);
        return subscription;
    };
    return ChangeFeedReplaySubject;
}(rxjs_1.Subject));
exports.ChangeFeedReplaySubject = ChangeFeedReplaySubject;
var ChangeFeedRecorder = /** @class */ (function () {
    function ChangeFeedRecorder() {
        this.initializingStarted = false;
        this.data = new Map();
        this.isReady = false;
        this.next = utils_1.changeFeedHandler(this);
    }
    ChangeFeedRecorder.prototype.replay = function (subscriber) {
        var e_1, _a;
        if (this.initializingStarted) {
            subscriber.next(["initializing"]);
        }
        try {
            for (var _b = __values(this.data.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var key = _c.value;
                subscriber.next(["set", key, this.data.get(key)]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (this.isReady === true) {
            subscriber.next(["ready"]);
        }
    };
    ChangeFeedRecorder.prototype.initializing = function () {
        this.data.clear();
        this.isReady = false;
        this.initializingStarted = true;
    };
    ChangeFeedRecorder.prototype.ready = function () {
        this.isReady = true;
    };
    ChangeFeedRecorder.prototype.set = function (key, value) {
        this.data.set(key, value);
    };
    ChangeFeedRecorder.prototype.del = function (key) {
        this.data.delete(key);
    };
    return ChangeFeedRecorder;
}());
