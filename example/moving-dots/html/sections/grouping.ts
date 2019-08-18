import { Quarter, allQuarters } from "../../data/quarter";
import { Context } from "../Context";
import { PointCf$ } from "../../data/feedGenerator";
import { rxReplace } from "../../../directives/rxReplace";
import { repeat } from "lit-html/directives/repeat";
import { PointsChartCanvas } from "../charts/pointsCanvas";
import { Observable } from "rxjs";

export const quarterLabels = {
  [Quarter.first]: "1st",
  [Quarter.second]: "2nd",
  [Quarter.third]: "3rd",
  [Quarter.fourth]: "4th"
};

export const quarterSubtitle = {
  [Quarter.first]: "x>0, y>0",
  [Quarter.second]: "x<0, y<0",
  [Quarter.third]: "x<0, y<0",
  [Quarter.fourth]: "x<0, y>0"
};

export type QuarterGroupedPointCf = Map<Quarter, PointCf$>;
export type QuarterGroupedPointCf$ = Observable<QuarterGroupedPointCf>;

export const Grouping = (
  { html, ctx }: Context,
  groupedPoints: QuarterGroupedPointCf$
) =>
  html`
    ${rxReplace(
      groupedPoints,
      groups =>
        html`
          <style></style>
          <div class="columns quarter-charts-columns">
            ${repeat(
              allQuarters,
              key => key,
              key => QuarterGroup(ctx, key, groups.get(key))
            )}
          </div>
        `
    )}
  `;

export const QuarterGroup = (
  { html, ctx }: Context,
  quarter: Quarter,
  points?: PointCf$
) =>
  html`
    <div class="column quarter-charts-column">
      <h3 class="subtitle">
        ${quarterLabels[quarter]}
        <small class="is-size-7 is-family-monospace">
          ${quarterSubtitle[quarter]}
        </small>
      </h3>
      ${points ? PointsChartCanvas(ctx, points) : null}
    </div>
  `;
