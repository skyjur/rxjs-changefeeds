import { Observable } from "rxjs";

export type ChangeFeed<Value = any, Key = any> =
  | ["initializing"]
  | ["ready"]
  | ["set", Key, Value]
  | ["del", Key];

export type ChangeFeed$<Value, Key = any> = Observable<ChangeFeed<Value, Key>>;
