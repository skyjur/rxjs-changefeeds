import { OperatorFunction, Observable } from "rxjs";
import { ChangeFeed } from "../types";
export declare const feedGroupBy: <GroupKey, Key, Value>(keySelector: (obj: Value) => GroupKey) => OperatorFunction<ChangeFeed<Key, Value>, ChangeFeed<GroupKey, Observable<ChangeFeed<Key, Value>>>>;
