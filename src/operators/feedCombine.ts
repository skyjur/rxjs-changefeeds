import { Observable } from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";

interface FeedCombine {
  <A, B, R>(
    input: [ChangeFeed$<A>, ChangeFeed$<B>],
    project: (obj1: A, obj2: B) => R
  ): ChangeFeed$<R>;

  <A, B, C, R>(
    input: [ChangeFeed$<A>, ChangeFeed$<B>, ChangeFeed$<C>],
    project: (obj1: A, obj2: B, obj3: C) => R
  ): ChangeFeed$<R>;

  <A, B, C, D, R>(
    input: [ChangeFeed$<A>, ChangeFeed$<B>, ChangeFeed$<C>, ChangeFeed$<D>],
    project: (obj1: A, obj2: B, obj3: C, obj4: D) => R
  ): ChangeFeed$<R>;

  <A, B, C, D, E, R>(
    input: [
      ChangeFeed$<A>,
      ChangeFeed$<B>,
      ChangeFeed$<C>,
      ChangeFeed$<D>,
      ChangeFeed$<E>
    ],
    project: (obj1: A, obj2: B, obj3: C, obj4: D, obj5: E) => R
  ): ChangeFeed$<R>;

  <R>(
    input: Array<ChangeFeed$<any>>,
    project: (...args: any[]) => R
  ): ChangeFeed$<R>;
}

export const feedCombine: FeedCombine = <Project>(
  feeds: Array<ChangeFeed$<any>>,
  project: (...args: any[]) => Project
) =>
  new Observable<ChangeFeed<any, Project>>(subscriber => {
    let initializing = false;
    const readyAll = feeds.map(() => true);
    const dataAll = feeds.map(() => new Map());
    const projectPublished: Set<string> = new Set();

    const subs = feeds.map((feed, index) =>
      feed.subscribe({
        next: changeFeedHandler<any, any>({
          initializing() {
            if (!initializing) {
              initializing = true;
              subscriber.next(["initializing"]);
            }
            readyAll[index] = false;
          },
          ready() {
            initializing = false;
            readyAll[index] = true;
            if (readyAll.every(isReady => isReady)) {
              subscriber.next(["ready"]);
            }
          },
          set(key: any, value: any) {
            dataAll[index].set(key, value);
            const combined = project(...dataAll.map(data => data.get(key)));
            if (combined) {
              subscriber.next(["set", key, combined]);
              projectPublished.add(key);
            } else {
              if (projectPublished.has(key)) {
                subscriber.next(["del", key]);
                projectPublished.delete(key);
              }
            }
          },
          del(key: any) {
            if (dataAll[index].has(key)) {
              dataAll[index].delete(key);
              if (dataAll.every(map => !map.has(key))) {
                if (projectPublished.has(key)) {
                  subscriber.next(["del", key]);
                  projectPublished.delete(key);
                }
              } else {
                const combined = project(...dataAll.map(data => data.get(key)));
                if (combined) {
                  subscriber.next(["set", key, combined]);
                  projectPublished.add(key);
                } else {
                  if (projectPublished.has(key)) {
                    subscriber.next(["del", key]);
                    projectPublished.delete(key);
                  }
                }
              }
            }
          }
        })
      })
    );

    return () => {
      for (const sub of subs) {
        sub.unsubscribe();
      }
    };
  });
