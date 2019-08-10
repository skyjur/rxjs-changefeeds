import { ChangeFeed$ } from "../types";
import { Observable } from "rxjs";
import { changeFeedHandler } from "../utils";

export function feedCount(feed: ChangeFeed$<any, any>): Observable<number> {
  return new Observable(subscriber => {
    const keys = new Set<any>();

    const sub = feed.subscribe({
      next: changeFeedHandler({
        initializing() {
          // do nothing
        },
        ready() {
          // do nothing
        },
        set(key, _value) {
          if (!keys.has(key)) {
            keys.add(key);
            subscriber.next(keys.size);
          }
        },
        del(key) {
          if (keys.has(key)) {
            keys.delete(key);
            subscriber.next(keys.size);
          }
        }
      })
    });

    return () => {
      sub.unsubscribe();
    };
  });
}
