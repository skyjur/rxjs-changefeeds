import {
  interval,
  OperatorFunction,
  Observable,
  Subject,
  BehaviorSubject,
  SchedulerLike
} from "rxjs";
import { filter, map, scan, throttle, tap } from "rxjs/operators";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";

export type Comparator<T> = (a: T, b: T) => number;

interface Options {
  throttleIntervalTime?: number;
  scheduler?: SchedulerLike;
}

export function feedSortedList<Value, Key = any>(
  cmp: Comparator<Value>,
  { throttleIntervalTime = 100, scheduler }: Options = {}
): OperatorFunction<ChangeFeed<Value, Key>, Array<BehaviorSubject<Value>>> {
  return (input: ChangeFeed$<Value>) => {
    return new Observable(subscriber => {
      const data = new Map<Key, BehaviorSubject<Value>>();
      let keySortIndex = new Map<Key, number>();
      let sortedKeys: Key[] = [];
      let updateIsPending = false;

      const update = new Subject<void>();
      const updateSub = update
        .pipe(
          tap(() => {
            updateIsPending = true;
          }),
          throttle(() => interval(throttleIntervalTime, scheduler))
        )
        .subscribe({
          next() {
            const keys = Array.from(data.keys());
            sortedKeys = keys.sort((key1, key2) => {
              return cmp(data.get(key1)!.value, data.get(key2)!.value);
            });
            keySortIndex = new Map(
              sortedKeys.map((key, index) => [key, index])
            );
            subscriber.next(sortedKeys.map(key => data.get(key)!));
            updateIsPending = false;
          }
        });

      const sub = input.subscribe({
        next: changeFeedHandler({
          initializing() {
            // do nothing
          },
          ready() {
            // do nothing
          },
          set(key, newValue) {
            if (data.has(key)) {
              data.get(key)!.next(newValue);
              if (!updateIsPending) {
                const i = keySortIndex.get(key)!;
                if (i > 0) {
                  const valueLeft = data.get(sortedKeys[i - 1])!.value;
                  if (cmp(valueLeft, newValue) > 0) {
                    update.next();
                  }
                }
                if (i < sortedKeys.length - 1) {
                  const valueRight = data.get(sortedKeys[i + 1])!.value;
                  if (cmp(newValue, valueRight) > 0) {
                    update.next();
                  }
                }
              }
            } else {
              data.set(key, new BehaviorSubject(newValue));
              update.next();
            }
          },
          del(key) {
            data.get(key)!.complete();
            data.delete(key);
            update.next();
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
        updateSub.unsubscribe();
        for (const subject of data.values()) {
          subject.complete();
        }
      };
    });
  };
}
