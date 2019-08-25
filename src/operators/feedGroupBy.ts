import { OperatorFunction, Observable, Subject } from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";
import { ChangeFeedReplaySubject } from "../ChangeFeedReplay";

type GroupedChangeFeed<GroupKey, Value, ValueKey> = ChangeFeed<
  ChangeFeed$<Value, ValueKey>,
  GroupKey
>;

export const feedGroupBy = <GroupKey, Value, ValueKey = any>(
  keySelector: (obj: Value) => GroupKey
): OperatorFunction<
  ChangeFeed<Value>,
  GroupedChangeFeed<GroupKey, Value, ValueKey>
> => {
  return (input: ChangeFeed$<Value, ValueKey>) => {
    return new Observable<GroupedChangeFeed<GroupKey, Value, ValueKey>>(
      subscriber => {
        const groups = new Map<
          GroupKey,
          ChangeFeedReplaySubject<Value, ValueKey>
        >();
        const recordToGroupMap = new Map<ValueKey, GroupKey>();
        const groupContent = new Map<GroupKey, Set<ValueKey>>();
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
            set(key: ValueKey, value: Value) {
              const groupKey = keySelector(value);

              if (
                recordToGroupMap.has(key) &&
                recordToGroupMap.get(key) !== groupKey
              ) {
                this.del!(key);
              }

              recordToGroupMap.set(key, groupKey);

              if (!groups.has(groupKey)) {
                const newGroup = new ChangeFeedReplaySubject<Value, ValueKey>();
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
            del(key: ValueKey) {
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
