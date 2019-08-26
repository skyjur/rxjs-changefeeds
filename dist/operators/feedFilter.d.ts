import { Observable, MonoTypeOperatorFunction } from "rxjs";
import { ChangeFeed } from "../types";
interface FilterFunction<Value> {
    (object: Value): boolean;
}
declare type FilterFunction$<Value> = Observable<FilterFunction<Value>>;
declare type ReturnType<Key, Value> = MonoTypeOperatorFunction<ChangeFeed<Key, Value>>;
export declare function feedFilter<Key = any, Value = any>(predicate: FilterFunction$<Value> | FilterFunction<Value>): ReturnType<Key, Value>;
export {};
