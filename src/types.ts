import { Observable } from "rxjs";

export type ChangeFeed<Key = any, Value = any> =
  | ["initializing"]
  | ["ready"]
  | ["set", Key, Value]
  | ["del", Key];

export type ChangeFeed$<Key = any, Value = any> = Observable<
  ChangeFeed<Key, Value>
>;
