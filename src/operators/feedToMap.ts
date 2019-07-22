import { BehaviorSubject, Observable, OperatorFunction, Subject, Subscriber } from "rxjs";
import { debounceTime, filter, map, scan } from "rxjs/operators";
import { ChangeFeed, ChangeFeed$, HasId } from "../types";

type Output<T> = Map<string, BehaviorSubject<T>>;

export function feedToMap<T extends HasId = HasId>(): OperatorFunction<ChangeFeed<T>, Output<T>> {
  return (input: ChangeFeed$<T>) => {
    return new Observable<Output<T>>((subscriber) => {
      const acc = new FeedToMapAccumulator(subscriber);
      const sub = input.subscribe({
        next(record) {
          acc.next(record)
        },
        complete() {
          acc.complete()
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

class FeedToMapAccumulator<T extends HasId> {
  public keysHasChanged: boolean = false;
  public data: Map<string, BehaviorSubject<T>> = new Map();

  constructor(private output: Subscriber<Output<T>>) { }

  public next(val: ChangeFeed<T>) {
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
    for(const s of this.data.values()) {
      s.complete()
    }
  }

  private set(key: string, obj: T) {
    if (this.data.has(key)) {
      this.data.get(key)!.next(obj);
    } else {
      this.data.set(key, new BehaviorSubject(obj));
      this.postMapUpdate();
    }
  }

  private del(key: string) {
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