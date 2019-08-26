import { Observable, SubscriptionLike, Observer, SchedulerLike } from "rxjs";
import { ChangeFeed } from "./types";
/**
 * Index last value in changefeed by key into BehaviorSubject
 */
export declare class ChangeFeedIndex<Key = any, Value = any> implements Partial<Observer<ChangeFeed<Key, Value>>>, SubscriptionLike {
    private scheduler;
    private state;
    private subscribers;
    closed: boolean;
    private isReady;
    constructor(scheduler?: SchedulerLike);
    next: (record: ChangeFeed<Key, Value>) => void;
    get(key: Key): Observable<Value | null>;
    complete(): void;
    unsubscribe(): void;
}
