import { ChangeFeed$ } from "../../../../src/types";
import { Point, PointCf$ } from "../../data/feedGenerator";
import { Context } from "../Context";
import { directive, NodePart } from "lit-html";
import { Unsubscribable } from "rxjs";
import { isElementOutOfVisibleScreen } from "../utils";

const size = 200;

interface State {
  canvas?: HTMLCanvasElement;
  pointsCf$?: PointCf$;
  interval?: any;
  sub?: Unsubscribable;
}

export const PointsChartCanvas = directive(
  ({ window, document }: Context, pointsCf$: PointCf$) => (
    part: NodePart & { _state?: State }
  ) => {
    const state = (part._state = part._state || {});
    const canvas = state.canvas || document.createElement("canvas");

    if (!state.canvas) {
      state.canvas = canvas;
      part.setValue(canvas);
      canvas.setAttribute("width", `${size}`);
      canvas.setAttribute("height", `${size}`);
    }

    if (state.pointsCf$ === pointsCf$) {
      return;
    }

    if (state.sub) {
      clearInterval(state.interval);
      state.sub.unsubscribe();
    }

    const pointsMap = new Map<string, Point>();
    let changes = 1;

    const interval = (state.interval = setInterval(() => {
      if (isElementOutOfVisibleScreen(canvas, window)) {
        return;
      }

      if (canvas.getAttribute("width") !== size.toString()) {
        const ctx = canvas.getContext("2d")!;
        changes += 1;
        ctx.clearRect(0, 0, canvas.scrollWidth, canvas.scrollHeight);
        canvas.setAttribute("width", `${size}`);
        canvas.setAttribute("height", `${size}`);
      }

      if (changes > 0) {
        changes = 0;

        const ctx = canvas.getContext("2d")!;

        const width = canvas.scrollWidth;
        const height = canvas.scrollHeight;
        ctx.clearRect(0, 0, width, height);
        drawGrid(ctx, width, height);

        redrawPoinsOnCanvas(
          ctx,
          pointsMap.values(),
          canvas.scrollWidth,
          canvas.scrollHeight
        );
      }
    }, 1000 / 30)); // 30 fps

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
        setTimeout(() => clearInterval(interval), 100);
      }
    });

    return canvas;
  }
);

const margin = 5;

const redrawPoinsOnCanvas = (
  context: CanvasRenderingContext2D,
  points: Iterable<Point>,
  width: number,
  height: number
): void => {
  const circleSize = Math.max(Math.min(height, width) * 0.02, 1);

  const x0 = width * 0.5;
  const y0 = height * 0.5;
  const scaleX = width * 0.5 - margin * 2;
  const scaleY = -(height * 0.5 - margin * 2);

  const tau = Math.PI * 2;
  const arcSize = circleSize * 0.5;
  const lineWidth = circleSize;

  for (const point of points) {
    const x = x0 + scaleX * point.x;
    const y = y0 + scaleY * point.y;
    context.beginPath();
    context.arc(x, y, arcSize, 0, tau);
    context.lineWidth = lineWidth;
    context.strokeStyle = point.color;
    context.stroke();
  }
};

const drawGrid = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  const x0 = width * 0.5;
  const y0 = height * 0.5;
  const scaleX = width * 0.5 - margin * 2;
  const scaleY = -(height * 0.5 - margin * 2);

  context.strokeStyle = "#eaeaea";
  context.fillStyle = "#eaeaea";
  context.font = "10px monospace";

  context.moveTo(x0, 0);
  context.lineTo(x0, height);

  context.moveTo(0, y0);
  context.lineTo(width, y0);

  context.lineWidth = 1;
  context.stroke();

  // arrow x
  context.beginPath();
  context.moveTo(width, y0);
  context.lineTo(width - 10, y0 - 3);
  context.lineTo(width - 10, y0 + 3);
  context.lineTo(width, y0);
  // arrow y
  context.moveTo(x0, 0);
  context.lineTo(x0 - 3, 10);
  context.lineTo(x0 + 3, 10);
  context.lineTo(x0, 0);
  context.fill();

  // x, y
  context.fillText("x", width - 6, y0 + 10);
  context.fillText("y", x0 + 6, 10);

  // +-0.5 markers
  for (const d of [-0.5, 0.5]) {
    const x = x0 + scaleX * d;
    context.beginPath();
    context.moveTo(x, y0 - 3);
    context.lineTo(x, y0 + 3);
    context.stroke();
    context.fillText((d > 0 ? " " : "") + d.toFixed(1), x - 15, y0 + 12);

    const y = y0 + scaleY * d;
    context.beginPath();
    context.moveTo(x0 - 3, y);
    context.lineTo(x0 + 3, y);
    context.stroke();
    context.fillText((d > 0 ? " " : "") + d.toFixed(1), x0 - 28, y + 3);
  }
};
