import { Context } from "./Context";
import { BehaviorSubject } from "rxjs";
import { RangeInput, RangeScale } from "./input/RangeInput";
import { ChangeFeed$ } from "../../../src/types";
import { Point } from "../data/feedGenerator";
import { PointsChartCanvas } from "./charts/pointsCanvas";
import { PointsGroupedByQuarter } from "./grouping/quarter";
import { SortedPoints } from "./sorting";

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
    <section class="container">
      <h2 class="title">Input</h2>
      <div class="columns">
        <div class="column">
          <div class="field">
            <label>Point updates per sec:</label>
            <div class="control">
              ${RangeInput(ctx, props.updatesPerSec, updatePerSecScale)}
            </div>
          </div>

          <div class="field">
            <label>
              Num of points:
            </label>
            <div class="control">
              ${RangeInput(ctx, props.numOfPoints, numOfPointsScale)}
            </div>
          </div>
        </div>
        <div class="column">
          ${PointsChartCanvas(ctx, props.pointsCf$)}
        </div>
      </div>
    </section>

    <section class="container">
      <h2 class="title">Group by quarter</h2>
      ${PointsGroupedByQuarter(ctx, props.pointsCf$)}
    </section>

    <section class="container">
      <h2 class="title">Sorted points by Point.x</h2>
      ${SortedPoints(ctx, props.pointsCf$)}
    </section>
  `;
};
