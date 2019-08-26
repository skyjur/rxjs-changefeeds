import { ChangeFeed } from "./types";

export interface ChangeFeedHandler<Key, Value> {
  initializing(): void;
  ready(): void;
  set(key: Key, value: Value): void;
  del(key: Key): void;
}

export function changeFeedHandler<Key, Value>(
  handler: Partial<ChangeFeedHandler<Key, Value>>
): (record: ChangeFeed<Key, Value>) => void {
  return (record: ChangeFeed<Key, Value>) => {
    switch (record[0]) {
      case "initializing":
        handler.initializing && handler.initializing();
        break;
      case "ready":
        handler.ready && handler.ready();
        break;
      case "set":
        handler.set && handler.set(record[1], record[2]);
        break;
      case "del":
        handler.del && handler.del(record[1]);
        break;
      default:
        throw new Error(`Invalid changefeed operation: ${record[0]}`);
    }
  };
}
