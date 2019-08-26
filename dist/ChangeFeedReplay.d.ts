import { Subject, Subscriber } from "rxjs";
import { ChangeFeed } from "./types";
/**
 * Buffer feed and reply all objects to newly connected subscriber
 *
 * Following ReplySubject paradigm of rxjs
 *
 */
export declare class ChangeFeedReplaySubject<Key, Value> extends Subject<ChangeFeed<Key, Value>> {
    private state;
    next(record: ChangeFeed<Key, Value>): void;
    _subscribe(subscriber: Subscriber<ChangeFeed<Key, Value>>): import("rxjs").Subscription;
}
