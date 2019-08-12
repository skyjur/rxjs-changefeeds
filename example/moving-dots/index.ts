import { MultiPointsCf } from "../sample-data/PointsFeed";
import { BehaviorSubject, of, interval } from "rxjs";
import { render } from "lit-html";
import { context } from "./html/Context";
import { Index } from "./html/Index";
import { map, share } from "rxjs/operators";

const updatesPerSec = new BehaviorSubject(50);
const updateInterval = updatesPerSec.pipe(map(val => 1000 / val));
const numOfPoints = new BehaviorSubject(5);
const pointsCf$ = MultiPointsCf(numOfPoints, updateInterval).pipe(share());

render(
  Index(context, {
    updatesPerSec,
    numOfPoints,
    pointsCf$
  }),
  document.getElementById("root")!
);
