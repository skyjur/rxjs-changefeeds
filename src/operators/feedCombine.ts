import { Observable } from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";

function feedCombine<T>(feeds: Array<ChangeFeed$<any>>, project: (...objs: any[]) => T): ChangeFeed$<T> {
  return new Observable((subscriber) => {

    let initializing = false
    const readyAll = feeds.map(() => true);
    const dataAll = feeds.map(() => new Map());
    const projectPublished: Set<string> = new Set();

    const subs = feeds.map((feed, index) => feed.subscribe({
      next: changeFeedHandler<any>({
          initializing() {
            if (!initializing) {
              initializing = true;
              subscriber.next(["initializing"]);
            }
            readyAll[index] = false;
            dataAll[index].clear();
            projectPublished.clear();
          },
          ready() {
            initializing = false;
            readyAll[index] = true;
            if (readyAll.every((isReady) => isReady)) {
              subscriber.next(["ready"])
            }
          },
          set(key: string, value: any) {
            dataAll[index].set(key, value);
            const combined = project(...dataAll.map((data) => data.get(key)));
            if(combined) {
              subscriber.next(["set", key, combined]);
              projectPublished.add(key);
            } else {
              if(projectPublished.has(key)) {
                subscriber.next(["del", key])
                projectPublished.delete(key)
              }
            }
          },
          del(key: string) {
            if(dataAll[index].has(key)) {
              dataAll[index].delete(key);
              if (dataAll.every((map) => !map.has(key))) {
                if(projectPublished.has(key)) {
                  subscriber.next(["del", key]);
                  projectPublished.delete(key);
                }
              } else {
                const combined = project(...dataAll.map((data) => data.get(key)));
                if(combined) {
                  subscriber.next(["set", key, combined]);
                  projectPublished.add(key);
                } else {
                  if(projectPublished.has(key)) {
                    subscriber.next(["del", key])
                    projectPublished.delete(key)
                  }
                }
              }
            }
          }
        })
    }));

    return () => {
      for (const sub of subs) {
        sub.unsubscribe();
      }
    };
  });
}

export function feedCombine2<
  A,
  B,
  R
>(
  feed1: ChangeFeed$<A>,
  feed2: ChangeFeed$<B>,
  project: (obj1: A, obj2: B) => R,
): ChangeFeed$<R> {
  return feedCombine<R>([feed1, feed2], project);
}

export function feedCombine3<
  A,
  B,
  C,
  R
>(
  feed1: ChangeFeed$<A>,
  feed2: ChangeFeed$<B>,
  feed3: ChangeFeed$<C>,
  project: (obj1: A, obj2: B, obj3: C) => R,
): ChangeFeed$<R> {
  return feedCombine<R>([feed1, feed2, feed3], project);
}

export function feedCombine4<
  A,
  B,
  C,
  D,
  R
>(
  feed1: ChangeFeed$<A>,
  feed2: ChangeFeed$<B>,
  feed3: ChangeFeed$<C>,
  feed4: ChangeFeed$<D>,
  project: (obj1: A, obj2: B, obj3: C, obj4: D) => R,
): ChangeFeed$<R> {
  return feedCombine<R>([feed1, feed2, feed3, feed4], project);
}

export function feedCombine5<
  A,
  B,
  C,
  D,
  E,
  R
>(
  feed1: ChangeFeed$<A>,
  feed2: ChangeFeed$<B>,
  feed3: ChangeFeed$<C>,
  feed4: ChangeFeed$<D>,
  feed5: ChangeFeed$<E>,
  project: (obj1: A, obj2: B, obj3: C, obj4: D, obj5: E) => R,
): ChangeFeed$<R> {
  return feedCombine<R>([feed1, feed2, feed3, feed4, feed5], project);
}
