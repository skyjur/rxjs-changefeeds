import { Observable } from "rxjs/internal/Observable";
import { ChangeFeed } from "../types";
export declare type number$ = Observable<number>;
export declare type void$ = Observable<void>;
export declare type boolean$ = Observable<boolean>;
export declare type Map$<K, V> = Observable<Map<K, V>>;
export declare type Array$<T> = Observable<T[]>;
export declare type AnyChangeFeed = ChangeFeed<any>;
export declare type AnyChangeFeed$ = Observable<AnyChangeFeed>;
export declare type AnyChangeFeedValues = {
    [key: string]: AnyChangeFeed;
};
