import { changeFeedHandler } from "../../../../src/utils";
import { Context } from "../Context";
import { ChangeFeed$ } from "../../../../src/types";
import { Point } from "../../data/feedGenerator";

const svgns: "http://www.w3.org/2000/svg" = "http://www.w3.org/2000/svg";
const xmlns: "http://www.w3.org/2000/xmlns/" = "http://www.w3.org/2000/xmlns/";

const size = 200;

export const PointsChartSvg = (
  { document }: Context,
  pointsCf$: ChangeFeed$<Point>
) => {
  const svg = document.createElementNS(svgns, "svg");
  svg.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute("viewBox", `-1.5 -1.5 3 3`);
  svg.setAttribute("width", `${size}`);
  svg.setAttribute("height", `${size}`);

  const elements = new Map<any, SVGCircleElement>();

  pointsCf$.subscribe({
    next: changeFeedHandler<Point, string>({
      set(key, value) {
        const circle =
          elements.get(key) || document.createElementNS(svgns, "circle");

        circle.setAttribute("cx", `${value.x}`);
        circle.setAttribute("cy", `${-value.y}`);

        if (!elements.has(key)) {
          circle.setAttribute("fill", value.color);
          circle.setAttribute("r", "0.05");
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
