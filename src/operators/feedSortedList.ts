import {
  OperatorFunction,
  Observable,
  Subject,
  BehaviorSubject,
  SchedulerLike,
  asyncScheduler,
  Unsubscribable
} from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";

export type Comparator<T> = (a: T, b: T) => number;
export type Comparator$<T> = Observable<Comparator<T>>;

interface Options {
  throttleTime?: number | null;
  scheduler?: SchedulerLike;
}

type Input<Key, Value> = ChangeFeed<Value, Key>;
type Output<Key, Value> = Array<Observable<Value> & { key: Key }>;
type ReturnType<Key, Value> = OperatorFunction<
  Input<Key, Value>,
  Output<Key, Value>
>;

export class ValueObservable<Key, Value> extends Observable<Value> {
  constructor(public key: Key, subject: Subject<Value>) {
    super(subscriber => {
      const sub = subject.subscribe(subscriber);
      return () => {
        sub.unsubscribe();
      };
    });
  }
}

export const feedSortedList = <Value, Key = any>(
  comparator: Comparator<Value> | Comparator$<Value>,
  { throttleTime = 100, scheduler = asyncScheduler }: Options = {}
): ReturnType<Key, Value> => {
  return (input: ChangeFeed$<Value>) => {
    return new Observable(subscriber => {
      type DataValue = {
        value: Value;
        subject: Subject<Value>;
        observable: ValueObservable<Key, Value>;
      };

      const data = new Map<Key, DataValue>();

      let cmp: Comparator<Value> | null =
        typeof comparator === "function" ? comparator : null;
      let keySortIndex = new Map<Key, number>();
      let sortedKeys: Key[] = [];

      let pendingFlush: Unsubscribable | null = null;

      const flush = () => {
        pendingFlush = null;
        const keys = Array.from(data.keys());
        sortedKeys = keys.sort((key1, key2) =>
          cmp!(data.get(key1)!.value, data.get(key2)!.value)
        );
        keySortIndex = new Map(sortedKeys.map((key, index) => [key, index]));
        subscriber.next(sortedKeys.map(key => data.get(key)!.observable));
      };

      const scheduleFlush = () => {
        if (!pendingFlush) {
          if (throttleTime === null) {
            flush();
          } else {
            pendingFlush = scheduler.schedule(flush, throttleTime);
          }
        }
      };

      const cmpSub =
        typeof comparator !== "function" &&
        comparator.subscribe({
          next(newCmp) {
            if (newCmp !== cmp) {
              cmp = newCmp;
              scheduleFlush();
            }
          }
        });

      const sub = input.subscribe({
        next: changeFeedHandler({
          set(key, newValue) {
            if (data.has(key)) {
              data.get(key)!.subject.next(newValue);
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
              const subject = new BehaviorSubject(newValue);
              const observable = new ValueObservable(key, subject);
              data.set(key, { value: newValue, subject, observable });
              scheduleFlush();
            }
          },
          del(key) {
            if (data.has(key)) {
              data.get(key)!.subject.complete();
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
          for (const { subject } of data.values()) {
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
        for (const { subject } of data.values()) {
          subject.complete();
        }
      };
    });
  };
};
