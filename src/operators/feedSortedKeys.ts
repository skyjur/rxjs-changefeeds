import { interval, OperatorFunction } from "rxjs";
import { filter, map, scan, throttle } from "rxjs/operators";
import { ChangeFeed, ChangeFeed$ } from "../types";

type Comparator<T> = (a: T, b: T) => number;

interface IOptions {
  throttleIntervalTime?: number;
}

interface IScanState<Value = any, Key = any> {
  hasUpdates: boolean;
  data: Map<Key, Value>;
  sortedKeys: Key[];
  keySortIndex: Map<Key, number>;
}

export function feedSortedKeys<Value = any, Key = any>(
  cmp: Comparator<Value>,
  { throttleIntervalTime = 100 }: IOptions = {},
): OperatorFunction<ChangeFeed<Value>, Key[]> {
  return (input: ChangeFeed$<Value>) => {
    return input.pipe(
        scan(scanHandler(cmp), null),
        throttle(() => interval(throttleIntervalTime)),
        filter((state) => state.hasUpdates),
        map(mapHandler(cmp)),
      );
  };
}

function scanHandler(cmp: Comparator<any>) {
  return (state: null | IScanState, record: ChangeFeed<any>) => {
    state = state || {
      data: new Map(),
      hasUpdates: true,
      keySortIndex: new Map(),
      sortedKeys: [],
    };
    switch (record[0]) {
      case "set":
        const [, key, newValue] = record;
        if (state.data.has(key)) {
          if (!state.hasUpdates) {
            const i = state.keySortIndex.get(key)!;
            if (i > 0) {
              const valueLeft = state.data.get(state.sortedKeys[i - 1]);
              if (cmp(valueLeft, newValue) > 0) {
                state.hasUpdates = true;
              }
            }
            if (i < state.sortedKeys.length - 1) {
              const valueRight = state.data.get(state.sortedKeys[i + 1]);
              if (cmp(newValue, valueRight) > 0) {
                state.hasUpdates = true;
              }
            }
          }
        } else {
          state.hasUpdates = true;
        }
        state.data.set(key, newValue);
        break;
      case "del":
        state.data.delete(record[1]);
        state.hasUpdates = true;
        break;
    }
    return state;
  };
}

function mapHandler(cmp: Comparator<any>) {
  return (state: IScanState) => {
    state.sortedKeys = Array.from(state.data.keys()).sort((key1, key2) => {
      return cmp(state.data.get(key1), state.data.get(key2));
    });
    state.keySortIndex = new Map(state.sortedKeys.map((key, index) => [key, index]));
    state.hasUpdates = false;
    return state.sortedKeys;
  };
}
