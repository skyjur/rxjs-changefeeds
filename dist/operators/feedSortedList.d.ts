import { OperatorFunction, Observable, Subject, SchedulerLike } from "rxjs";
import { ChangeFeed } from "../types";
export declare type Comparator<T> = (a: T, b: T) => number;
export declare type Comparator$<T> = Observable<Comparator<T>>;
interface Options {
    throttleTime?: number | null;
    scheduler?: SchedulerLike;
}
export declare class ValueObservable<Key, Value> extends Observable<Value> {
    key: Key;
    constructor(key: Key, subject: Subject<Value>);
}
export declare const feedSortedList: <Key = any, Value = any>(comparator: Comparator<Value> | Observable<Comparator<Value>>, { throttleTime, scheduler }?: Options) => OperatorFunction<ChangeFeed<Key, Value>, (Observable<Value> & {
    key: Key;
})[]>;
export {};
