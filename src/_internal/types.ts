import { Observable } from "rxjs/internal/Observable";
import { ChangeFeed } from "../types";

export type number$ = Observable<number>;
export type void$ = Observable<void>;
export type AnyChangeFeed = ChangeFeed<any>;
export type AnyChangeFeed$ = Observable<AnyChangeFeed>;

export type AnyChangeFeedValues = { [key: string]: AnyChangeFeed };
