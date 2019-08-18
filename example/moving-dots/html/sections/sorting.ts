import { Context } from "../Context";
import { PointCf$, Point$, Point } from "../../data/feedGenerator";
import { feedSortedList } from "../../../../src/operators/feedSortedList";
import { Array$ } from "../../../../src/_internal/types";

export const SortedPoints = (
  { ctx, html, rxReplace, repeat, styleMap }: Context,
  pointList$: Array$<Point$>
) =>
  html`
    <style>
      .sorted-points-container {
        position: relative;
      }
      .sorted-points-row {
        position: absolute;
        height: 1.5em;
        font-family: monospace;
        transition: top 0.5s;
      }
      .sorted-points-bubble {
        position: absolute;
        display: block;
        width: 0.8em;
        height: 0.8em;
        border-radius: 50%;
        top: 0.35em;
      }
    </style>
    ${rxReplace<Point$[]>(
      pointList$,
      pointList => html`
        <div
          class="sorted-points-container"
          style=${styleMap({
            height: (1.5 * pointList.length).toFixed(2) + "em"
          })}
        >
          ${repeat(
            pointList,
            point$ => point$,
            (point$, index) =>
              html`
                <div class="sorted-points-row" style=${styleMap({
                  top: (index * 1.5).toFixed(2) + "em"
                })}>
                    ${rxReplace(
                      point$,
                      point => html`
                        x=${(point.x > 0 ? " " : "") + point.x.toFixed(3)}
                        ${SlidingPoint(ctx, point)}
                      `
                    )}
                  </div>
                </div>
              `
          )}
        </div>
      `
    )}
  `;

export const SlidingPoint = (
  { html, styleMap }: Context,
  { color, x }: Point
) => html`
  <i
    class="sorted-points-bubble"
    style=${styleMap({
      backgroundColor: color,
      left: (170 + x * 100).toFixed(2) + "px"
    })}
  ></i>
`;