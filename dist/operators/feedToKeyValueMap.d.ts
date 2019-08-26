import { OperatorFunction } from "rxjs";
import { ChangeFeed } from "../types";
export declare const feedToKeyValueMap: <K, V>() => OperatorFunction<ChangeFeed<K, V>, Map<K, V>>;
