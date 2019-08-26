import { ChangeFeed } from "./types";
export interface ChangeFeedHandler<Key, Value> {
    initializing(): void;
    ready(): void;
    set(key: Key, value: Value): void;
    del(key: Key): void;
}
export declare function changeFeedHandler<Key, Value>(handler: Partial<ChangeFeedHandler<Key, Value>>): (record: ChangeFeed<Key, Value>) => void;
