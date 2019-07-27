import { Observable, OperatorFunction, Unsubscribable } from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";

export function feedFilter<T>(
  predicate: (a: T) => boolean,
): OperatorFunction<ChangeFeed<T>, ChangeFeed<T>> {
  return (feed: ChangeFeed$<T>) => {

    return new Observable((subscriber) => {
      const tracked = new Set();

      const sub = feed.subscribe({
        next: changeFeedHandler({
            initializing() {
              tracked.clear();
              subscriber.next(["initializing"]);
            },
            ready() {
              subscriber.next(["ready"]);
            },
            set(key: string, value: T) {
              if (predicate(value)) {
                tracked.add(key);
                subscriber.next(["set", key, value]);
              } else if (tracked.has(key)) {
                tracked.delete(key);
                subscriber.next(["del", key]);
              }
            },
            del(key: string) {
              if (tracked.has(key)) {
                tracked.delete(key);
                subscriber.next(["del", key]);
              }
            }
        }),
        complete() {
          subscriber.complete()
        },
        error(error) {
          subscriber.error(error)
        }
      });

      return () => {
        sub.unsubscribe();
      };
    });
  };
}
