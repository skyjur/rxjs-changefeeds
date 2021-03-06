import { feedGroupBy } from "../../../src/operators/feedGroupBy";
import { PointCf$, Point, PointCf } from "./feedGenerator";
import { Array$ } from "../../../src/_internal/types";
import { feedFilter } from "../../../src/operators/feedFilter";
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

export const quarterFilter = (quarters: Quarter[]) => (point: Point) =>
  quarters.indexOf(getQuarter(point)) !== -1;

export const getQuarter = ({ x, y }: Point) =>
  x > 0
    ? y > 0
      ? Quarter.first
      : Quarter.second
    : y < 0
    ? Quarter.third
    : Quarter.fourth;
