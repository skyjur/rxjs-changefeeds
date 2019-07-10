import { OperatorFunction, Observable, Subject } from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { changeFeedHandler } from "../utils";

export function feedGroupBy<K, V>(keySelector: (obj: V) => K): OperatorFunction<ChangeFeed<V>, Map<K, ChangeFeed$<V>>> {
    return (input: ChangeFeed$<V>) => {
        return new Observable<Map<K, ChangeFeed$<V>>>((subscriber) => {
            const groups = new Map<K, Subject<ChangeFeed<V>>>()
            const keyGroupKey = new Map<string, K>();
            const trackedGroupKeys = new Map<K, Set<string>>()
            let ready = false
            let initializing = false

            const sub = input.subscribe({
                next: changeFeedHandler({
                    initializing() {
                        initializing = true
                        ready = false
                        if(groups.size > 0) {
                            const groupsList = Array.from(groups.values())
                            groups.clear()
                            keyGroupKey.clear()
                            trackedGroupKeys.clear()
                            subscriber.next(groups)
                            for(const group of groupsList) {
                                group.complete()
                            }
                        }
                    },
                    ready() {
                        ready = true
                        initializing = false
                        for(const group of groups.values()) {
                            group.next(['ready'])
                        }
                    },
                    set(key: string, value: V) {
                        const groupKey = keySelector(value)
                        const oldGroupKey = keyGroupKey.get(key)

                        if(oldGroupKey && oldGroupKey !== groupKey) {
                            this.del(key)
                        }
                        keyGroupKey.set(key, groupKey)

                        if(!groups.has(groupKey)) {
                            const newGroup = new Subject<ChangeFeed<V>>()
                            groups.set(groupKey, newGroup);
                            trackedGroupKeys.set(groupKey, new Set())
                            subscriber.next(groups)
                            if(initializing) {
                                newGroup.next(['initializing'])
                            }
                        }

                        groups.get(groupKey)!.next(['set', key, value])
                        trackedGroupKeys.get(groupKey)!.add(key)
                    },
                    del(key: string) {
                        const groupKey = keyGroupKey.get(key)
                        if(groupKey) {
                            const group = groups.get(groupKey)
                            if(group) {
                                group.next(['del', key])
                                const trackedKeys = trackedGroupKeys.get(groupKey)!
                                trackedKeys.delete(key)
                                if(trackedKeys.size === 0) {
                                    groups.delete(groupKey)
                                    trackedGroupKeys.delete(groupKey)
                                    group.complete()
                                    subscriber.next(groups)
                                }
                            }
                        }
                    }
                }),
                complete() {
                    subscriber.complete()
                    for(const group of groups.values()) {
                        group.complete()
                    }
                },
                error(e) {
                    subscriber.error(e)
                }
            })

            return () => {
                sub.unsubscribe()
            }
        })
    };
}