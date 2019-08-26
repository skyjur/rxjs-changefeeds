import { OperatorFunction, Observable } from "rxjs";
import { changeFeedHandler } from "../utils";
import { ChangeFeed } from "../types";

export const feedToKeyValueMap = <K, V>(): OperatorFunction<
  ChangeFeed<K, V>,
  Map<K, V>
> => source =>
  new Observable(subscriber => {
    const data = new Map<any, any>();

    const subscription = source.subscribe({
      next: changeFeedHandler({
        set(key, value) {
          if (data.get(key) !== value) {
            data.set(key, value);
            subscriber.next(data);
          }
        },
        del(key) {
          if (data.has(key)) {
            data.delete(key);
            subscriber.next(data);
          }
        }
      }),
      complete() {
        subscriber.complete();
      },
      error(e) {
        subscriber.error(e);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  });
