import { OperatorFunction } from "rxjs";
import { ChangeFeed } from "../types";
export declare const feedMapValues: <Key, Value, MappedValue>(p: (value: Value) => MappedValue) => OperatorFunction<ChangeFeed<Key, Value>, ChangeFeed<Key, MappedValue>>;
