import { Point } from "./feedGenerator";
import { maxBy } from "lodash";
import { Observable } from "rxjs";

export const pointShadeFilter = (shades: Shade[]) => {
  return (point: Point) => shades.indexOf(getPointShade(point)) !== -1;
};

export enum Shade {
  red,
  yellow,
  green,
  cyan,
  blue,
  violet,
  grey
}

export const allShades: Shade[] = [
  Shade.red,
  Shade.yellow,
  Shade.green,
  Shade.cyan,
  Shade.blue,
  Shade.violet,
  Shade.grey
];

export type Shade$ = Observable<Shade>;

export const getPointShade = (point: Point) => getShade(point.color);

export const getShade = (color: string): Shade => {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  if (Math.abs(r - b) < 20 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
    return Shade.grey;
  }
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
};
