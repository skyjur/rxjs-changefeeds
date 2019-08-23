import { BehaviorSubject } from "rxjs";
import { Shade, allShades } from "../../data/shade";
import { Context } from "../Context";
import { MultiChoiceInput } from "../../../common/html/MultiChoiceInput";
import { PointCf$ } from "../../data/feedGenerator";
import { quarterLabels, quarterSubtitle } from "./grouping";
import { Quarter, allQuarters } from "../../data/quarter";
import { PointsChartCanvas } from "../feedOutput/pointsCanvas";
import { RawChangeFeed } from "../feedOutput/rawChangeFeed";
import { Array$ } from "../../../../src/_internal/types";

export interface FilteringProps {
  selectedShades$: BehaviorSubject<Shade[]>;
  selectedQuarters$: BehaviorSubject<Quarter[]>;
  filteredPoints$: PointCf$;
  shadeChoices$: Array$<Shade>;
}

export const shadeLabels: { [key in Shade]: string } = {
  [Shade.red]: "red",
  [Shade.yellow]: "yellow",
  [Shade.green]: "green",
  [Shade.cyan]: "cyan",
  [Shade.blue]: "blue",
  [Shade.violet]: "violet"
};

const ShadeLabel = ({  }: Context, shade: Shade) => shadeLabels[shade];
const QuarterLabel = ({ html }: Context, quarter: Quarter) =>
  html`
    ${quarterLabels[quarter]}
    <small class="is-size-7 is-family-monospace"
      >(${quarterSubtitle[quarter]})</small
    >
  `;

export const Filtering = (
  { ctx, html, rxReplace }: Context,
  {
    selectedShades$,
    selectedQuarters$,
    filteredPoints$,
    shadeChoices$
  }: FilteringProps
) => html`
  <div class="columns">
    <div class="column is-one-fifth">
      <h3 class="subtitle">Shade</h3>
      ${rxReplace(shadeChoices$, shades =>
        MultiChoiceInput<Shade>(ctx, shades, selectedShades$, ShadeLabel)
      )}
    </div>

    <div class="column is-one-fifth">
      <h3 class="subtitle">Quarter</h3>
      ${MultiChoiceInput<Quarter>(
        ctx,
        allQuarters,
        selectedQuarters$,
        QuarterLabel
      )}
    </div>

    <div class="column">
      ${PointsChartCanvas(ctx, filteredPoints$)}
    </div>

    <div class="column">
      ${RawChangeFeed(filteredPoints$)}
    </div>
  </div>
`;
