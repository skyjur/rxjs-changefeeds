import { feedGroupBy } from "../../../../src/operators/feedGroupBy";
import { PointCf$, Point } from "../feedGenerator";

export enum Quarter {
  first,
  second,
  third,
  fourth
}

export const groupPointsByQuarter = (points: PointCf$) =>
  points.pipe(feedGroupBy<Quarter, Point>(({ x, y }) => getQuarter(x, y)));

export const getQuarter = (x: number, y: number) =>
  x > 0
    ? y > 0
      ? Quarter.first
      : Quarter.second
    : y < 0
    ? Quarter.third
    : Quarter.fourth;
