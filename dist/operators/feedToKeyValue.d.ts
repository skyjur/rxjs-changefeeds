import { OperatorFunction } from "rxjs";
import { ChangeFeed } from "../types";
declare type Result<V> = {
    [key: string]: V;
};
export declare const feedToKeyValueObject: <Value>() => OperatorFunction<ChangeFeed<string | number, Value>, Result<Value>>;
export {};
