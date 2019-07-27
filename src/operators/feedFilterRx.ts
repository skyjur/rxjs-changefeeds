import { Observable, OperatorFunction, Unsubscribable } from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";

export function feedFilterRx<Value=any, Key=any>(
  predicate$: Observable<(a: Value) => boolean>,
): OperatorFunction<ChangeFeed<Value, Key>, ChangeFeed<Value>> {
  return (feed: ChangeFeed$<Value>) => {

    return new Observable((subscriber) => {
      const excluded = new Map<Key, Value>();
      const included = new Map<Key, Value>();
      let predicate = (a: Value) => false

      const predicateSub = predicate$.subscribe({
          next(newPredicate) {
            predicate = newPredicate;

            const toBeExcluded = Array.from(included.entries())
                .filter(([key, value]) => !predicate(value));
            
            const toBeIncluded = Array.from(excluded.entries())
                .filter(([key, value]) => predicate(value));

            for(const [key, value] of toBeExcluded) {
                excluded.set(key, value);
                included.delete(key);
                subscriber.next(['del', key]);
            }

            for(const [key, value] of toBeIncluded) {
                included.set(key, value);
                excluded.delete(key);
                subscriber.next(['set', key, value]);
            }
          },
          error(e) {
              console.error(e)
          }
      })

      const feedSub = feed.subscribe({
        next: changeFeedHandler<Value, Key>({
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
                if(excluded.has(key)) {
                    excluded.delete(key);
                }
                subscriber.next(["set", key, value]);
              } else {
                  excluded.set(key, value);
                  if(included.has(key)) {
                    included.delete(key);
                    subscriber.next(["del", key]);
                  }
              }
            },
            del(key: Key) {
                if(excluded.has(key)) {
                    excluded.delete(key)
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
          subscriber.error(error)
        }
      });

      return () => {
        predicateSub.unsubscribe();
        feedSub.unsubscribe();
      };
    });
  };
}
