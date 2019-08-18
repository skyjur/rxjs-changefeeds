import { BehaviorSubject } from "rxjs";
import { Shade, rxOpReactiveShadeFilter, allShades } from "../data/shade";
import { Context } from "./Context";
import { MultiChoiceInput } from "./input/MultiChoiceInput";
import { PointCf$ } from "../data/feedGenerator";
import { shadeLabels } from "./grouping/shade";
import { quarterLabels, quarterSubtitle } from "./grouping/quarter";
import {
  Quarter,
  rxOpReactiveQuarterFilter,
  allQuarters
} from "../data/quarter";
import { PointsChartCanvas } from "./charts/pointsCanvas";
import { rxOpReactiveRangeFilter } from "../data/range";

const selectedShades$ = new BehaviorSubject<Shade[]>(allShades);
const selectedQuarters$ = new BehaviorSubject<Quarter[]>(allQuarters);

selectedShades$.subscribe({
  next(val) {
    console.log("selectedShades", val.map(key => shadeLabels[key]));
  }
});

const ShadeLabel = ({  }: Context, shade: Shade) => shadeLabels[shade];
const QuarterLabel = ({ html }: Context, quarter: Quarter) =>
  html`
    ${quarterLabels[quarter]}
    <small class="is-size-7">(${quarterSubtitle[quarter]})</small>
  `;

const filterPoints = (points$: PointCf$): PointCf$ =>
  points$.pipe(
    rxOpReactiveShadeFilter(selectedShades$),
    rxOpReactiveQuarterFilter(selectedQuarters$)
  );

export const Filtering = ({ ctx, html }: Context, points$: PointCf$) => html`
  <div class="columns">
    <div class="column">
      <h3 class="subtitle">Shade</h3>
      ${MultiChoiceInput<Shade>(ctx, allShades, selectedShades$, ShadeLabel)}
    </div>

    <div class="column">
      <h3 class="subtitle">Quarter</h3>
      ${MultiChoiceInput<Quarter>(
        ctx,
        allQuarters,
        selectedQuarters$,
        QuarterLabel
      )}
    </div>

    <div class="column">
      ${PointsChartCanvas(ctx, filterPoints(points$))}
    </div>
  </div>
`;
