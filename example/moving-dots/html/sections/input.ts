import { Context } from "../Context";
import { RangeScale, RangeInput } from "../../../common/html/RangeInput";
import { PointsChartCanvas } from "../feedOutput/pointsCanvas";
import { PointCf$ } from "../../data/feedGenerator";
import { BehaviorSubject } from "rxjs";
import { RawChangeFeed } from "../feedOutput/rawChangeFeed";
import { rxReplace } from "../../../directives/rxReplace";

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

export const Input = (
  { html, ctx }: Context,
  { numOfPoints$, updatesPerSec$, pointsCf$ }: InputProps
) => html`
  <div class="columns">
    <div class="column">
      <div class="field">
        <label>
          Num of points:
        </label>
        <div class="control">
          ${RangeInput(ctx, numOfPoints$, numOfPointsScale)}
        </div>
      </div>

      <div class="field">
        ${SpeedButtons(ctx, updatesPerSec$)}
      </div>
    </div>
    <div class="column">
      ${PointsChartCanvas(ctx, pointsCf$)}
    </div>
    <div class="column">
      ${RawChangeFeed(pointsCf$)}
    </div>
  </div>
`;

const SpeedButtons = (ctx: Context, speed$: BehaviorSubject<number>) =>
  rxReplace(speed$, value => [
    Button(ctx, "Stop", () => speed$.next(0), { disabled: value === 0 }),
    Button(ctx, "Slow", () => speed$.next(0.75), {
      disabled: value === 0.75
    }),
    Button(ctx, "Fast", () => speed$.next(20), { disabled: value === 20 })
  ]);

const Button = (
  { html }: Context,
  label: string,
  onClick = () => undefined as void,
  { disabled = false } = {}
) =>
  html`
    <button @click=${onClick} .disabled=${disabled}>${label}</button>
  `;
