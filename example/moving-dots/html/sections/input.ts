import { Context } from "../Context";
import { RangeScale, RangeInput } from "../../../common/html/RangeInput";
import { PointsChartCanvas } from "../charts/pointsCanvas";
import { PointCf$ } from "../../data/feedGenerator";
import { BehaviorSubject } from "rxjs";

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

export interface InputProps {
  updatesPerSec$: BehaviorSubject<number>;
  numOfPoints$: BehaviorSubject<number>;
  pointsCf$: PointCf$;
}

export const Input = ({ html, ctx }: Context, props: InputProps) => html`
  <div class="columns">
    <div class="column">
      <div class="field">
        <label>Point updates per sec:</label>
        <div class="control">
          ${RangeInput(ctx, props.updatesPerSec$, updatePerSecScale)}
        </div>
      </div>

      <div class="field">
        <label>
          Num of points:
        </label>
        <div class="control">
          ${RangeInput(ctx, props.numOfPoints$, numOfPointsScale)}
        </div>
      </div>
    </div>
    <div class="column">
      ${PointsChartCanvas(ctx, props.pointsCf$)}
    </div>
  </div>
`;
