import { Context } from "./Context";
import { BehaviorSubject } from "rxjs";
import { UpdatesPerSecInput } from "./input/UpdatesPerSecInput";
import { PointsChartSvg } from "./PointsChart/PointsChart";
import { ChangeFeed$ } from "../../../src/types";
import { Point } from "../../sample-data/PointFeedGenerator";

interface IndexProps {
  updatesPerSecondSubject: BehaviorSubject<number>;
  pointsCf$: ChangeFeed$<Point>;
}

export const Index = ({ html, ctx }: Context, props: IndexProps) => {
  return html`
    <section>
      ${UpdatesPerSecInput(ctx, props.updatesPerSecondSubject)}
    </section>
    <section>
      ${PointsChartSvg(ctx, props.pointsCf$)}
    </section>
  `;
};
