import { BehaviorSubject, OperatorFunction } from "rxjs";
import { ChangeFeed } from "../types";
declare type Output<Key, Value> = Map<Key, BehaviorSubject<Value>>;
export declare function feedToObservablesMap<Key, Value>(): OperatorFunction<ChangeFeed<Key, Value>, Output<Key, Value>>;
export {};
