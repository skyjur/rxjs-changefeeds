import { ChangeFeed$ } from "../../../../src/types";
import { Point } from "../../../sample-data/PointsFeed";
import { Context } from "../Context";
import { changeFeedHandler } from "../../../../src/utils";

const svgns: "http://www.w3.org/2000/svg" = "http://www.w3.org/2000/svg";
const xmlns: "http://www.w3.org/2000/xmlns/" = "http://www.w3.org/2000/xmlns/";

export const PointsChartSvg = (
  { document }: Context,
  pointsCf$: ChangeFeed$<Point>
) => {
  const svg = document.createElementNS(svgns, "svg");
  svg.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute("viewBox", `-1.5 -1.5 3 3`);
  svg.setAttribute("width", `300`);
  svg.setAttribute("height", `300`);

  const elements = new Map<any, SVGCircleElement>();

  pointsCf$.subscribe({
    next: changeFeedHandler<Point, string>({
      set(key, value) {
        const circle =
          elements.get(key) || document.createElementNS(svgns, "circle");

        circle.setAttribute("fill", value.color);
        circle.setAttribute("cx", `${value.x}`);
        circle.setAttribute("cy", `${value.y}`);
        circle.setAttribute("r", "0.05");

        if (!elements.has(key)) {
          elements.set(key, circle);
          svg.appendChild(circle);
        }
      },
      del(key) {
        svg.removeChild(elements.get(key)!);
        elements.delete(key);
      }
    })
  });

  return svg;
};
