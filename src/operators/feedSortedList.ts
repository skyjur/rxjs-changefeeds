import {
  interval,
  OperatorFunction,
  Observable,
  Subject,
  BehaviorSubject,
  SchedulerLike,
  asyncScheduler,
  Unsubscribable
} from "rxjs";
import { filter, map, scan, throttle, tap } from "rxjs/operators";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";

export type Comparator<T> = (a: T, b: T) => number;
export type Comparator$<T> = Observable<Comparator<T>>;

interface Options {
  throttleTime?: number;
  scheduler?: SchedulerLike;
}

export function feedSortedList<Value, Key = any>(
  comparator: Comparator<Value> | Comparator$<Value>,
  { throttleTime = 100, scheduler = asyncScheduler }: Options = {}
): OperatorFunction<ChangeFeed<Value, Key>, Array<BehaviorSubject<Value>>> {
  return (input: ChangeFeed$<Value>) => {
    return new Observable(subscriber => {
      const data = new Map<Key, BehaviorSubject<Value>>();
      let cmp: Comparator<Value> | null =
        typeof comparator === "function" ? comparator : null;
      let keySortIndex = new Map<Key, number>();
      let sortedKeys: Key[] = [];

      let pendingFlush: Unsubscribable | null = null;

      const flush = () => {
        const keys = Array.from(data.keys());
        sortedKeys = keys.sort((key1, key2) =>
          cmp!(data.get(key1)!.value, data.get(key2)!.value)
        );
        keySortIndex = new Map(sortedKeys.map((key, index) => [key, index]));
        subscriber.next(sortedKeys.map(key => data.get(key)!));
        pendingFlush = null;
      };

      const scheduleFlush = () => {
        if (!pendingFlush) {
          pendingFlush = scheduler.schedule(flush, throttleTime);
        }
      };

      const cmpSub =
        typeof comparator !== "function" &&
        comparator.subscribe({
          next(newCmp) {
            if (newCmp && newCmp !== cmp) {
              cmp = newCmp;
              scheduleFlush();
            }
          }
        });

      const sub = input.subscribe({
        next: changeFeedHandler({
          set(key, newValue) {
            if (data.has(key)) {
              data.get(key)!.next(newValue);
              if (cmp && !pendingFlush) {
                const i = keySortIndex.get(key)!;
                if (i > 0) {
                  const valueLeft = data.get(sortedKeys[i - 1])!.value;
                  if (cmp(valueLeft, newValue) > 0) {
                    scheduleFlush();
                  }
                }
                if (i < sortedKeys.length - 1) {
                  const valueRight = data.get(sortedKeys[i + 1])!.value;
                  if (cmp(newValue, valueRight) > 0) {
                    scheduleFlush();
                  }
                }
              }
            } else {
              data.set(key, new BehaviorSubject(newValue));
              scheduleFlush();
            }
          },
          del(key) {
            if (data.has(key)) {
              data.get(key)!.complete();
              data.delete(key);
              scheduleFlush();
            }
          }
        }),
        error(e) {
          subscriber.error(e);
        },
        complete() {
          subscriber.complete();
          for (const subject of data.values()) {
            subject.complete();
          }
        }
      });

      return () => {
        sub.unsubscribe();
        cmpSub && cmpSub.unsubscribe();
        if (pendingFlush) {
          pendingFlush.unsubscribe();
        }
        for (const subject of data.values()) {
          subject.complete();
        }
      };
    });
  };
}
