import { BehaviorSubject } from "rxjs";
import { Shade } from "../data/shade";
import { Context } from "./Context";
import { MultiChoiceInput } from "./input/MultiChoiceInput";
import { PointCf$ } from "../data/feedGenerator";
import { shadeLabels } from "./grouping/shade";
import { quarterLabels, quarterSubtitle } from "./grouping/quarter";
import { Quarter } from "../data/quarter";

const selectedShades$ = new BehaviorSubject<Shade[]>([]);
const selectedQuarters$ = new BehaviorSubject<Quarter[]>([]);

const shadeChoices: Shade[] = Object.keys(shadeLabels) as any[];
const quarterChoices: Quarter[] = Object.keys(quarterLabels) as any[];

const ShadeLabel = ({  }: Context, shade: Shade) => shadeLabels[shade];
const QuarterLabel = ({ html }: Context, quarter: Quarter) =>
  html`
    ${quarterLabels[quarter]}
    <small class="is-size-7">(${quarterSubtitle[quarter]})</small>
  `;

export const Filtering = ({ ctx, html }: Context, points$: PointCf$) => html`
  <div class="columns">
    <div class="column">
      <h3 class="subtitle">Shade</h3>
      ${MultiChoiceInput<Shade>(ctx, shadeChoices, selectedShades$, ShadeLabel)}
    </div>

    <div class="column">
      <h3 class="subtitle">Quarter</h3>
      ${MultiChoiceInput<Quarter>(
        ctx,
        quarterChoices,
        selectedQuarters$,
        QuarterLabel
      )}
    </div>
  </div>
`;
