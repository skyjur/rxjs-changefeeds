import { ChangeFeed$ } from "../types";
import { Observable } from "rxjs";
export declare function feedCount(feed: ChangeFeed$<any, any>): Observable<number>;
