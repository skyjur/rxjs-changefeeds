import { Quarter, allQuarters } from "../../data/quarter";
import { Context } from "../Context";
import { PointCf$ } from "../../data/feedGenerator";
import { rxReplace } from "../../../directives/rxReplace";
import { repeat } from "lit-html/directives/repeat";
import { PointsChartCanvas } from "../feedOutput/pointsCanvas";
import { Observable, of } from "rxjs";
import { RawChangeFeed } from "../feedOutput/rawChangeFeed";

export const quarterLabels = {
  [Quarter.first]: "1st",
  [Quarter.second]: "2nd",
  [Quarter.third]: "3rd",
  [Quarter.fourth]: "4th"
};

export const quarterSubtitle = {
  [Quarter.first]: "x>0, y>0",
  [Quarter.second]: "x>0, y<0",
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
          <div class="columns quarter-charts-columns">
            <div class="column">
              <div class="columns is-desktop">
                ${QuarterGroup(ctx, Quarter.first, groups.get(Quarter.first))}
                ${QuarterGroup(ctx, Quarter.second, groups.get(Quarter.second))}
              </div>
            </div>
            <div class="column">
              <div class="columns is-desktop">
                ${QuarterGroup(ctx, Quarter.third, groups.get(Quarter.third))}
                ${QuarterGroup(ctx, Quarter.fourth, groups.get(Quarter.fourth))}
              </div>
            </div>
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
      ${PointsChartCanvas(ctx, points || of())}
      ${RawChangeFeed(points || of(), { height: 100, width: 200 })}
    </div>
  `;
