import { Observable } from "rxjs";

export type ChangeFeed<T> =
  ["initializing"] |
  ["ready"] |
  ["set", string, T] |
  ["del", string];

export type ChangeFeed$<T> = Observable<ChangeFeed<T>>;
