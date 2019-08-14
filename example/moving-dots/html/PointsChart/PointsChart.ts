import { ChangeFeed$ } from "../../../../src/types";
import { Point } from "../../../sample-data/PointsFeed";
import { Context } from "../Context";
import { changeFeedHandler } from "../../../../src/utils";
import { stringify } from "querystring";
import { directive } from "lit-html";
import { cacheResult } from "../../../directives/cacheResult";

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

export const PointsChartCanvas = (
  context: Context,
  pointsCf$: ChangeFeed$<Point>
) => cacheResult(pointsCf$, () => _PointsChartCanvas(context, pointsCf$));

const _PointsChartCanvas = (
  { document }: Context,
  pointsCf$: ChangeFeed$<Point>
) => {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("width", `${size}`);
  canvas.setAttribute("height", `${size}`);
  const ctx = canvas.getContext("2d")!;

  const pointsMap = new Map<string, Point>();
  let changes = 0;

  const interval = setInterval(() => {
    if (changes > 0) {
      changes = 0;
      redrawPoinsOnCanvas(
        ctx,
        pointsMap.values(),
        canvas.scrollWidth,
        canvas.scrollHeight
      );
    }
  }, 1000 / 30); // 30 fps

  pointsCf$.subscribe({
    next(record) {
      switch (record[0]) {
        case "set":
          changes += 1;
          pointsMap.set(record[1], record[2]);
          break;
        case "del":
          changes += 1;
          pointsMap.delete(record[1]);
      }
    },
    complete() {
      clearInterval(interval);
    }
  });

  return canvas;
};

const redrawPoinsOnCanvas = (
  context: CanvasRenderingContext2D,
  points: Iterable<Point>,
  width: number,
  height: number
) => {
  context.clearRect(0, 0, width, height);

  const circleSize = Math.max(Math.min(height, width) * 0.02, 1);

  const offsetX = width * 0.5;
  const offsetY = height * 0.5;
  const scaleX = width * 0.5 - circleSize - 1;
  const scaleY = height * 0.5 - circleSize - 1;

  const tau = Math.PI * 2;
  const arcSize = circleSize * 0.5;
  const lineWidth = circleSize;

  for (const point of points) {
    const x = offsetX + scaleX * point.x;
    const y = offsetY - scaleY * point.y;
    context.beginPath();
    context.arc(x, y, arcSize, 0, tau);
    context.lineWidth = lineWidth;
    context.strokeStyle = point.color;
    context.stroke();
  }
};
