import { feedFilter } from "../../../src/operators/feedFilter";
import { Point, PointCf$ } from "./feedGenerator";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

interface Range {
  min: number;
  max: number;
}

interface PointRange {
  x: Range;
  y: Range;
}

type PointRange$ = Observable<PointRange>;

export const rxOpReactiveRangeFilter = (range$: PointRange$) =>
  feedFilter(range$.pipe(map(range => rangeFilter(range))));

export const rangeFilter = ({
  x: { min: xMin, max: xMax },
  y: { min: yMin, max: yMax }
}: PointRange) => (p: Point) =>
  p.x > xMin && p.x < xMax && p.y > yMin && p.y < yMax;
