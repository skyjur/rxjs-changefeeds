import { OperatorFunction, Observable, Subject } from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";
import { ChangeFeedReplaySubject } from "../ChangeFeedReplay";

type GroupedChangeFeed<GroupKey, Key, Value> = ChangeFeed<
  GroupKey,
  ChangeFeed$<Key, Value>
>;

export const feedGroupBy = <GroupKey, Key, Value>(
  keySelector: (obj: Value) => GroupKey
): OperatorFunction<
  ChangeFeed<Key, Value>,
  GroupedChangeFeed<GroupKey, Key, Value>
> => {
  return (input: ChangeFeed$<Key, Value>) => {
    return new Observable<GroupedChangeFeed<GroupKey, Key, Value>>(
      subscriber => {
        const groups = new Map<GroupKey, ChangeFeedReplaySubject<Key, Value>>();
        const recordToGroupMap = new Map<Key, GroupKey>();
        const groupContent = new Map<GroupKey, Set<Key>>();
        let ready = false;
        let initializing = false;

        const sub = input.subscribe({
          next: changeFeedHandler({
            initializing() {
              initializing = true;
              ready = false;
              subscriber.next(["initializing"]);
            },
            ready() {
              ready = true;
              initializing = false;
              for (const group of groups.values()) {
                group.next(["ready"]);
              }
            },
            set(key: Key, value: Value) {
              const groupKey = keySelector(value);

              if (
                recordToGroupMap.has(key) &&
                recordToGroupMap.get(key) !== groupKey
              ) {
                this.del!(key);
              }

              recordToGroupMap.set(key, groupKey);

              if (!groups.has(groupKey)) {
                const newGroup = new ChangeFeedReplaySubject<Key, Value>();
                groups.set(groupKey, newGroup);
                groupContent.set(groupKey, new Set());
                subscriber.next(["set", groupKey, newGroup]);
                if (initializing) {
                  newGroup.next(["initializing"]);
                }
              }
              groupContent.get(groupKey)!.add(key);
              groups.get(groupKey)!.next(["set", key, value]);
            },
            del(key: Key) {
              if (recordToGroupMap.has(key)) {
                const groupKey = recordToGroupMap.get(key)!;
                if (groups.has(groupKey)) {
                  const group = groups.get(groupKey)!;
                  const trackedKeys = groupContent.get(groupKey)!;
                  if (trackedKeys.has(key)) {
                    trackedKeys.delete(key);
                    group.next(["del", key]);
                    if (trackedKeys.size === 0) {
                      groups.delete(groupKey);
                      groupContent.delete(groupKey);
                      group.complete();
                      subscriber.next(["del", groupKey]);
                    }
                  }
                }
              }
            }
          }),
          complete() {
            subscriber.complete();
            for (const group of groups.values()) {
              group.complete();
            }
          },
          error(e) {
            subscriber.error(e);
          }
        });

        return () => {
          sub.unsubscribe();
        };
      }
    );
  };
};
