import { OperatorFunction, Observable } from "rxjs";
import { changeFeedHandler } from "../utils";
import { ChangeFeed } from "../types";

type Result<V> = { [key: string]: V };

export const feedToKeyValueObject = <Value>(): OperatorFunction<
  ChangeFeed<string | number, Value>,
  Result<Value>
> => source =>
  new Observable(subscriber => {
    const data: any = {};

    const subscription = source.subscribe({
      next: changeFeedHandler({
        set(key, value) {
          if (data[key] !== value) {
            data[key] = value;
            subscriber.next(data);
          }
        },
        del(key) {
          if (key in data) {
            delete data[key];
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
