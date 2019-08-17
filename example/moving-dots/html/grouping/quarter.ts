import { Quarter, groupPointsByQuarter } from "../../data/quarter";
import { Context } from "../Context";
import { PointCf$ } from "../../data/feedGenerator";
import { rxReplace } from "../../../directives/rxReplace";
import { repeat } from "lit-html/directives/repeat";
import { PointsChartCanvas } from "../charts/pointsCanvas";

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

export const PointsGroupedByQuarter = (
  { html, ctx }: Context,
  points: PointCf$
) =>
  html`
    ${rxReplace(
      groupPointsByQuarter(points),
      groups =>
        html`
          <style></style>
          <div class="columns quarter-charts-columns">
            ${repeat(
              [Quarter.first, Quarter.second, Quarter.third, Quarter.fourth],
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
