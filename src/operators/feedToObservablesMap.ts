import {
  BehaviorSubject,
  Observable,
  OperatorFunction,
  Subscriber
} from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";

type Output<Key, Value> = Map<Key, BehaviorSubject<Value>>;

export function feedToObservablesMap<Key, Value>(): OperatorFunction<
  ChangeFeed<Key, Value>,
  Output<Key, Value>
> {
  return (input: ChangeFeed$<Key, Value>) => {
    return new Observable<Output<Key, Value>>(subscriber => {
      const acc = new FeedToMapAccumulator<Key, Value>(subscriber);
      const sub = input.subscribe({
        next(record) {
          acc.next(record);
        },
        complete() {
          acc.complete();
          subscriber.complete();
        },
        error(error) {
          subscriber.error(error);
        }
      });
      return () => {
        sub.unsubscribe();
      };
    });
  };
}

class FeedToMapAccumulator<Key, Value> {
  public keysHasChanged: boolean = false;
  public data: Map<Key, BehaviorSubject<Value>> = new Map();

  constructor(private output: Subscriber<Output<Key, Value>>) {}

  public next(val: ChangeFeed<Key, Value>) {
    switch (val[0]) {
      case "initializing":
        this.data.clear();
        this.postMapUpdate();
        break;
      case "ready":
        break;
      case "set":
        this.set(val[1], val[2]);
        break;
      case "del":
        this.del(val[1]);
        break;
    }
  }

  complete() {
    for (const s of this.data.values()) {
      s.complete();
    }
  }

  private set(key: Key, obj: Value) {
    if (this.data.has(key)) {
      this.data.get(key)!.next(obj);
    } else {
      this.data.set(key, new BehaviorSubject(obj));
      this.postMapUpdate();
    }
  }

  private del(key: Key) {
    if (this.data.has(key)) {
      this.data.get(key)!.complete();
      this.data.delete(key);
      this.postMapUpdate();
    }
  }

  private postMapUpdate() {
    this.output.next(this.data);
  }
}
