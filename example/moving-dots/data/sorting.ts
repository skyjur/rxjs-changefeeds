import { Comparator } from "../../../src/operators/feedSortedList";
import { Point } from "./feedGenerator";

export enum SortField {
  xAxis = "xAxis",
  yAxis = "yAxis"
}

export enum SortDir {
  Asc,
  Desc
}

export type SortBy = [SortField, SortDir];

const pointComparators: {
  [field in SortField]: { [dir in SortDir]: Comparator<Point> };
} = {
  [SortField.xAxis]: {
    [SortDir.Asc]: (a, b) => a.x - b.x,
    [SortDir.Desc]: (a, b) => b.x - a.x
  },
  [SortField.yAxis]: {
    [SortDir.Asc]: (a, b) => a.y - b.y,
    [SortDir.Desc]: (a, b) => b.y - a.y
  }
};

const fieldLabels: { [field in SortField]: string } = {
  [SortField.xAxis]: "x axis",
  [SortField.yAxis]: "y axis"
};

const dirLabels: { [field in SortDir]: string } = {
  [SortDir.Asc]: "asc.",
  [SortDir.Desc]: "desc."
};

export const pointCmp = (field: SortField, dir: SortDir): Comparator<Point> =>
  pointComparators[field][dir];

export const getSortFieldLabel = (field: SortField) => fieldLabels[field];

export const getSortDirLabel = (dir: SortDir) => dirLabels[dir];
