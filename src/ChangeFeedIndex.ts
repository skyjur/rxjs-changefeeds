import {
  Observable,
  SubscriptionLike,
  Observer,
  Subscriber,
  asyncScheduler,
  SchedulerLike
} from "rxjs";
import { ChangeFeed } from "./types";
import { changeFeedHandler } from "./utils";

/**
 * Index last value in changefeed by key into BehaviorSubject
 */
export class ChangeFeedIndex<Value, Key = any>
  implements Partial<Observer<ChangeFeed<Value>>>, SubscriptionLike {
  private state: Map<Key, Value> = new Map();
  private subscribers = new Map<Key, Subscriber<Value | null>[]>();
  public closed = false;
  private isReady = false;

  constructor(private scheduler: SchedulerLike = asyncScheduler) {}

  public next = changeFeedHandler({
    initializing: () => {
      this.state.clear();
      this.isReady = false;
    },
    ready: () => {
      this.isReady = true;
      this.subscribers.forEach((subscribers, key) => {
        if (!this.state.has(key)) {
          subscribers.forEach(subscriber => {
            this.scheduler.schedule(() => {
              subscriber.next(null);
            });
          });
        }
      });
    },
    set: (key: Key, value: Value) => {
      this.state.set(key, value);
      for (const subscriber of this.subscribers.get(key) || []) {
        this.scheduler.schedule(() => {
          subscriber.next(value);
        });
      }
    },
    del: (key: Key) => {
      this.state.delete(key);
      for (const subscriber of this.subscribers.get(key) || []) {
        this.scheduler.schedule(() => {
          subscriber.next(null);
        });
      }
    }
  });

  get(key: Key): Observable<Value | null> {
    return new Observable(subscriber => {
      if (this.state.has(key)) {
        this.scheduler.schedule(() => {
          subscriber.next(this.state.get(key)!);
        });
      } else if (this.isReady) {
        this.scheduler.schedule(() => {
          subscriber.next(null);
        });
      }
      if (!this.subscribers.has(key)) {
        this.subscribers.set(key, []);
      }
      this.subscribers.get(key)!.push(subscriber);
      return () => {
        const subscribers = this.subscribers.get(key) || [];
        const index = subscribers.indexOf(subscriber);
        if (index !== -1) {
          subscribers.splice(index, 1);
          if (subscribers.length === 0) {
            this.subscribers.delete(key);
          }
        }
      };
    });
  }

  complete() {
    this.unsubscribe();
  }

  unsubscribe() {
    this.subscribers.forEach(subscribers =>
      subscribers.forEach(subscriber => {
        this.scheduler.schedule(() => {
          subscriber.complete();
        });
      })
    );
    this.closed = true;
    this.next = () => null;
    this.state.clear();
    this.subscribers.clear();
  }
}
