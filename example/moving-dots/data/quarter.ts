import { feedGroupBy } from "../../../src/operators/feedGroupBy";
import { PointCf$, Point, PointCf } from "./feedGenerator";
import { Array$ } from "../../../src/_internal/types";
import { feedFilterRx } from "../../../src/operators/feedFilterRx";
import { OperatorFunction, Observable } from "rxjs";
import { map } from "rxjs/operators";

export enum Quarter {
  first,
  second,
  third,
  fourth
}

export const allQuarters = [
  Quarter.first,
  Quarter.second,
  Quarter.third,
  Quarter.fourth
];

export type QuarterGroupedPointCf = Map<Quarter, PointCf$>;
export type QuarterGroupedPointCf$ = Observable<QuarterGroupedPointCf>;

export const groupPointsByQuarter = (
  points: PointCf$
): QuarterGroupedPointCf$ =>
  points.pipe(feedGroupBy<Quarter, Point, string>(getQuarter));

export const rxOpReactiveQuarterFilter = (
  quarters$: Array$<Quarter>
): OperatorFunction<PointCf, PointCf> =>
  feedFilterRx(quarters$.pipe(map(quarterFilter)));

export const quarterFilter = (quarters: Quarter[]) => (point: Point) =>
  quarters.indexOf(getQuarter(point)) !== -1;

export const getQuarter = ({ x, y }: { x: number; y: number }) =>
  x > 0
    ? y > 0
      ? Quarter.first
      : Quarter.second
    : y < 0
    ? Quarter.third
    : Quarter.fourth;
