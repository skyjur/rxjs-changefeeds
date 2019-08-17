import { Context } from "../Context";
import { PointCf$ } from "../../data/feedGenerator";
import { rxReplace } from "../../../directives/rxReplace";
import { repeat } from "lit-html/directives/repeat";
import { PointsChartCanvas } from "../charts/pointsCanvas";
import { groupPointsByShade, Shade } from "../../data/grouping/shade";

export const PointsGroupedByShade = (
  { html, ctx }: Context,
  points: PointCf$
) =>
  html`
    ${rxReplace(
      groupPointsByShade(points),
      shadeGroups =>
        html`
          <table>
            <tr>
              ${repeat(
                Array.from(shadeGroups.keys()).sort(),
                key => key,
                key => ShadeGroup(ctx, key, shadeGroups.get(key)!)
              )}
            </tr>
          </table>
        `
    )}
  `;

export const ShadeGroup = (
  { html, ctx }: Context,
  shade: Shade,
  points: PointCf$
) =>
  html`
    <td>
      <h3>${shadeLabels[shade]}</h3>
      ${PointsChartCanvas(ctx, points)}
    </td>
  `;

export const shadeLabels: { [key in Shade]: string } = {
  [Shade.red]: "red",
  [Shade.yellow]: "yellow",
  [Shade.green]: "green",
  [Shade.cyan]: "cyan",
  [Shade.blue]: "blue",
  [Shade.violet]: "violet",
  [Shade.grey]: "grey"
};
