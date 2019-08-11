import {
  MultiPointsCf,
  VariableIntervalPointCf
} from "../sample-data/PointsFeed";
import { BehaviorSubject, of, interval } from "rxjs";
import { render } from "lit-html";
import { context } from "./html/Context";
import { Index } from "./html/Index";
import { throttle } from "rxjs/operators";

const updateInterval = new BehaviorSubject(10);
const numOfPoints = new BehaviorSubject(10);
const pointsCf$ = MultiPointsCf(
  numOfPoints.pipe(throttle(() => interval(1000))),
  () => VariableIntervalPointCf(updateInterval)
);

pointsCf$.subscribe({
  next: console.log
});

render(
  Index(context, {
    updateInterval,
    numOfPoints,
    pointsCf$: of()
  }),
  document.getElementById("root")!
);
