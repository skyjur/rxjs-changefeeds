import { Observable } from "rxjs";
export declare type ChangeFeed<Key = any, Value = any> = ["initializing"] | ["ready"] | ["set", Key, Value] | ["del", Key];
export declare type ChangeFeed$<Key = any, Value = any> = Observable<ChangeFeed<Key, Value>>;
