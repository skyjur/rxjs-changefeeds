import { Point, PointCf$ } from "../feedGenerator";
import { Map$ } from "../../../../src/_internal/types";
import { feedGroupBy } from "../../../../src/operators/feedGroupBy";
import { maxBy } from "lodash";

export const groupPointsByShade = (points: PointCf$): Map$<Shade, PointCf$> =>
  points.pipe(feedGroupBy<Shade, Point>(getPointShade));

export enum Shade {
  red,
  yellow,
  green,
  cyan,
  blue,
  violet,
  grey
}

export const getPointShade = (point: Point) => getShade(point.color);

export const getShade = (color: string): Shade => {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 6), 16);
  const b = parseInt(color.slice(6, 9), 16);
  if (Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(b - g)) < 20) {
    return Shade.grey;
  } else {
    const shadesAndWeights: [Shade, number][] = [
      [Shade.red, r],
      [Shade.yellow, r * 0.6 + g * 0.6],
      [Shade.green, g],
      [Shade.cyan, g * 0.6 + b * 0.6],
      [Shade.blue, b],
      [Shade.violet, r * 0.6 + b * 0.6]
    ];
    const [shade] = maxBy(shadesAndWeights, ([, weight]) => weight);
    return shade;
  }
};
