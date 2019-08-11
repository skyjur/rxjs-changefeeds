import { Context } from "./Context";
import { BehaviorSubject } from "rxjs";
import { RangeInput, RangeScale } from "./input/RangeInput";
import { PointsChartSvg } from "./PointsChart/PointsChart";
import { ChangeFeed$ } from "../../../src/types";
import { Point } from "../../sample-data/PointsFeed";

interface IndexProps {
  updateInterval: BehaviorSubject<number>;
  numOfPoints: BehaviorSubject<number>;
  pointsCf$: ChangeFeed$<Point>;
}

const updateIntervalScale: RangeScale = {
  min: 0,
  max: 1000,
  out: (input: number) => Math.floor(Math.pow(input, 2) / 1000),
  in: (output: number) => Math.ceil(Math.pow(output * 1000, 0.5))
};

const numOfPointsScale: RangeScale = {
  min: 1,
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
          ${RangeInput(ctx, props.updateInterval, numOfPointsScale)}
        </label>
      </div>

      <div>
        <label>
          Num of points:
          ${RangeInput(ctx, props.numOfPoints, updateIntervalScale)}
        </label>
      </div>
    </section>
    <section>
      ${PointsChartSvg(ctx, props.pointsCf$)}
    </section>
  `;
};