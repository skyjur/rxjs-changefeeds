import { Context } from "./Context";
import { BehaviorSubject, of } from "rxjs";
import { RangeInput, RangeScale } from "./input/RangeInput";
import { PointsChartSvg, PointsChartCanvas } from "./PointsChart/PointsChart";
import { ChangeFeed$ } from "../../../src/types";
import { Point, PointCf$ } from "../../sample-data/PointsFeed";
import { feedGroupBy } from "../../../src/operators/feedGroupBy";
import { rxReplace } from "../../directives/rxReplace";
import { repeat } from "lit-html/directives/repeat";
import { styleMap } from "lit-html/directives/style-map";
import { maxBy } from "lodash";
import { feedSortedList } from "../../../src/operators/feedSortedList";
import { stat } from "fs";

interface IndexProps {
  updatesPerSec: BehaviorSubject<number>;
  numOfPoints: BehaviorSubject<number>;
  pointsCf$: ChangeFeed$<Point>;
}

const updatePerSecScale: RangeScale = {
  min: 0,
  max: 1000,
  out: (input: number) => Math.floor(Math.pow(input, 2) / 1000),
  in: (output: number) => Math.ceil(Math.pow(output * 1000, 0.5))
};

const numOfPointsScale: RangeScale = {
  min: 0,
  max: 100,
  out: val => val,
  in: val => val
};

export const Index = ({ html, ctx }: Context, props: IndexProps) => {
  return html`
    <section>
      <div>
        <label>
          Point updates per sec:
          ${RangeInput(ctx, props.updatesPerSec, updatePerSecScale)}
        </label>
      </div>

      <div>
        <label>
          Num of points: ${RangeInput(ctx, props.numOfPoints, numOfPointsScale)}
        </label>
      </div>
    </section>

    <section>
      ${PointsChartCanvas(ctx, props.pointsCf$)}
    </section>

    <section>
      <h2>Group by quarter</h2>
      ${PointsGroupedByQuarter(ctx, props.pointsCf$)}
    </section>

    <section>
      <h2>Group by shade</h2>
      ${PointsGroupedByShade(ctx, props.pointsCf$)}
    </section>

    <section>
      <h2>Sorted points by Point.x</h2>
      ${SortedPoints(ctx, props.pointsCf$)}
    </section>
  `;
};

const SortedPoints = ({ ctx, html }: Context, points: PointCf$) =>
  html`
    <style>
      .sorted-points-container {
        position: relative;
      }
      .sorted-points-row {
        position: absolute;
        height: 1.5em;
        font-family: monospace;
        transition: top 0.5s;
      }
      .sorted-points-bubble {
        position: absolute;
        display: block;
        width: 0.8em;
        height: 0.8em;
        border-radius: 50%;
        top: 0.35em;
      }
    </style>
    ${rxReplace(
      points.pipe(
        feedSortedList((a, b) => a.x - b.x, {
          throttleIntervalTime: 500
        })
      ),
      pointList => html`
        <div
          class="sorted-points-container"
          style=${styleMap({
            height: (1.5 * pointList.length).toFixed(2) + "em"
          })}
        >
          ${repeat(
            pointList,
            point => point,
            (point$, index) =>
              html`
                <div class="sorted-points-row" style=${styleMap({
                  top: (index * 1.5).toFixed(2) + "em"
                })}>
                    ${rxReplace(
                      point$,
                      point => html`
                        x=${(point.x > 0 ? " " : "") + point.x.toFixed(3)}
                        ${SortedPointsBubble(ctx, point)}
                      `
                    )}
                  </div>
                </div>
              `
          )}
        </div>
      `
    )}
  `;

const prevIndex = new WeakMap();

const d = ({ x, y }: Point) => Math.sqrt(2) - Math.sqrt(x * x + y * y);

const indexChange = (target: any, index: number) => {
  const state = prevIndex.get(target) || { index, change: 0 };
  const change = state.index === index ? state.change : state.index - index;
  prevIndex.set(target, { index, change });
  return change;
};

const SortedPointsBubble = ({ html }: Context, { color, x }: Point) => html`
  <i
    class="sorted-points-bubble"
    style=${styleMap({
      backgroundColor: color,
      left: (170 + x * 100).toFixed(2) + "px"
    })}
  ></i>
`;

const PointsGroupedByShade = ({ html, ctx }: Context, points: PointCf$) =>
  html`
    ${rxReplace(
      groupPointsByShade(points),
      shadeGroups =>
        html`
          <table>
            <tr>
              ${repeat(
                Array.from(shadeGroups.keys()).sort(),
                key => key,
                key => ShadeGroup(ctx, key, shadeGroups.get(key)!)
              )}
            </tr>
          </table>
        `
    )}
  `;

const PointsGroupedByQuarter = ({ html, ctx }: Context, points: PointCf$) =>
  html`
    ${rxReplace(
      groupPointsByQuarter(points),
      groups =>
        html`
          <table>
            <tr>
              ${repeat(
                [Quarter.first, Quarter.second, Quarter.third, Quarter.fourth],
                key => key,
                key => QuarterGroup(ctx, key, groups.get(key)! || of())
              )}
            </tr>
          </table>
        `
    )}
  `;

const ShadeGroup = ({ html, ctx }: Context, shade: Shade, points: PointCf$) =>
  html`
    <td>
      <h3>${shadeLabels[shade]}</h3>
      ${PointsChartCanvas(ctx, points)}
    </td>
  `;

const QuarterGroup = (
  { html, ctx }: Context,
  quarter: Quarter,
  points: PointCf$
) =>
  html`
    <td>
      <h3>${quarterLabels[quarter]}</h3>
      ${PointsChartCanvas(ctx, points)}
    </td>
  `;

enum Quarter {
  first,
  second,
  third,
  fourth
}

const quarterLabels = {
  [Quarter.first]: "1st",
  [Quarter.second]: "2nd",
  [Quarter.third]: "3rd",
  [Quarter.fourth]: "4th"
};

const groupPointsByShade = (points: PointCf$) =>
  points.pipe(feedGroupBy<Shade, Point>(getPointShade));

const groupPointsByQuarter = (points: PointCf$) =>
  points.pipe(feedGroupBy<Quarter, Point>(({ x, y }) => getQuarter(x, y)));

const getQuarter = (x: number, y: number) =>
  x > 0
    ? y > 0
      ? Quarter.first
      : Quarter.second
    : y < 0
    ? Quarter.third
    : Quarter.fourth;

enum Shade {
  red,
  yellow,
  green,
  cyan,
  blue,
  violet,
  grey
}

const shadeLabels: { [key in Shade]: string } = {
  [Shade.red]: "red",
  [Shade.yellow]: "yellow",
  [Shade.green]: "green",
  [Shade.cyan]: "cyan",
  [Shade.blue]: "blue",
  [Shade.violet]: "violet",
  [Shade.grey]: "grey"
};

const getPointShade = (point: Point) => getShade(point.color);

const getShade: (color: string) => Shade = color => {
  const [, ...colors] = /#(..)(..)(..)/.exec(color);
  const [r, g, b] = colors.map(color => parseInt(color, 16));
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
