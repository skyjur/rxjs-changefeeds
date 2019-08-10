import { PointFeedGenerator, Point } from "../sample-data/PointFeedGenerator";
import { BehaviorSubject, interval, of, ConnectableObservable } from "rxjs";
import { map, switchMap, multicast } from "rxjs/operators";
import { feedCount } from "../../src/operators/feedCount";
import { render } from "lit-html";
import { context } from "./html/Context";
import { Index } from "./html/Index";
import { ChangeFeedReplaySubject } from "../../src";
import { ChangeFeed$, ChangeFeed } from "../../src/types";

const pointGenerator = new PointFeedGenerator();
pointGenerator.targetSize = 10;
const updatesPerSecondSubject = new BehaviorSubject(10);
const pointsCf$ = updatesPerSecondSubject.pipe(
  switchMap(value => (value > 0 ? interval(1000 / value) : of())),
  map(() => pointGenerator.next()),
  multicast(() => new ChangeFeedReplaySubject<Point, string>())
) as ConnectableObservable<ChangeFeed<Point, string>>;

pointsCf$.connect();

render(
  Index(context, {
    updatesPerSecondSubject,
    pointsCf$
  }),
  document.getElementById("root")!
);
