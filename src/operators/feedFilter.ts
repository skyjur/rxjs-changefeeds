import { Observable, of, MonoTypeOperatorFunction } from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";

interface FilterFunction<Value> {
  (object: Value): boolean;
}

type FilterFunction$<Value> = Observable<FilterFunction<Value>>;

type ReturnType<Key, Value> = MonoTypeOperatorFunction<ChangeFeed<Key, Value>>;

export function feedFilter<Key = any, Value = any>(
  predicate: FilterFunction$<Value> | FilterFunction<Value>
): ReturnType<Key, Value> {
  const predicate$: FilterFunction$<Value> =
    typeof predicate === "function" ? of(predicate) : predicate;
  return (feed: ChangeFeed$<Key, Value>) => {
    return new Observable<ChangeFeed<Key, Value>>(subscriber => {
      const excluded = new Map<Key, Value>();
      const included = new Map<Key, Value>();
      let predicate: FilterFunction<Value> = _val => false;

      const predicateSub = predicate$.subscribe({
        next(newPredicate) {
          predicate = newPredicate;

          const toBeExcluded = Array.from(included.entries()).filter(
            ([, value]) => !predicate(value)
          );

          const toBeIncluded = Array.from(excluded.entries()).filter(
            ([, value]) => predicate(value)
          );

          for (const [key, value] of toBeExcluded) {
            excluded.set(key, value);
            included.delete(key);
            subscriber.next(["del", key]);
          }

          for (const [key, value] of toBeIncluded) {
            included.set(key, value);
            excluded.delete(key);
            subscriber.next(["set", key, value]);
          }
        },
        error(e) {
          console.error(e);
        }
      });

      const feedSub = feed.subscribe({
        next: changeFeedHandler<Key, Value>({
          initializing() {
            included.clear();
            excluded.clear();
            subscriber.next(["initializing"]);
          },
          ready() {
            subscriber.next(["ready"]);
          },
          set(key: Key, value: Value) {
            if (predicate(value)) {
              included.set(key, value);
              if (excluded.has(key)) {
                excluded.delete(key);
              }
              subscriber.next(["set", key, value]);
            } else {
              excluded.set(key, value);
              if (included.has(key)) {
                included.delete(key);
                subscriber.next(["del", key]);
              }
            }
          },
          del(key: Key) {
            if (excluded.has(key)) {
              excluded.delete(key);
            }
            if (included.has(key)) {
              included.delete(key);
              subscriber.next(["del", key]);
            }
          }
        }),
        complete() {
          subscriber.complete();
          predicateSub.unsubscribe();
        },
        error(error) {
          subscriber.error(error);
        }
      });

      return () => {
        predicateSub.unsubscribe();
        feedSub.unsubscribe();
      };
    });
  };
}
