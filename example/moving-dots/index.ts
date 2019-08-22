import { PointsChangeFeed, Point } from "./data/feedGenerator";
import { BehaviorSubject, combineLatest } from "rxjs";
import { render } from "lit-html";
import { Context } from "./html/Context";
import { Index } from "./html";
import { map, share } from "rxjs/operators";
import { allShades, Shade, pointShadeFilter } from "./data/shade";
import {
  allQuarters,
  Quarter,
  getQuarter,
  quarterFilter
} from "./data/quarter";
import { Input } from "./html/sections/input";
import { Grouping } from "./html/sections/grouping";
import { SortedPoints } from "./html/sections/sorting";
import {
  feedSortedList,
  Comparator$
} from "../../src/operators/feedSortedList";
import { Filtering } from "./html/sections/filtering";
import { feedFilterRx } from "../../src/operators/feedFilterRx";
import { feedGroupBy } from "../../src/operators/feedGroupBy";
import { SortBy, pointCmp, SortField, SortDir } from "./data/sorting";

/**
 * INPUT CONFIG
 */
const updatesPerSec$ = new BehaviorSubject(20);
const updateInterval$ = updatesPerSec$.pipe(
  map(val => (val === 0 ? 99999999 : 1000 / val))
);
const numOfPoints$ = new BehaviorSubject(12);

/**
 * CHANGEFEED GENERATOR
 */
const pointsCf$ = PointsChangeFeed(numOfPoints$, updateInterval$).pipe(share());

/**
 * FILTERING
 */
const selectedShades$ = new BehaviorSubject<Shade[]>(allShades);
const selectedQuarters$ = new BehaviorSubject<Quarter[]>(allQuarters);
const filteredPoints$ = pointsCf$.pipe(
  feedFilterRx(selectedShades$.pipe(map(pointShadeFilter))),
  feedFilterRx(selectedQuarters$.pipe(map(quarterFilter)))
);

/**
 * GROUPING SECTION STATE
 */
const groupedPoints$ = pointsCf$.pipe(
  feedGroupBy<Quarter, Point, string>(getQuarter)
);

/**
 * SORTING SECTION
 */
const sortField$ = new BehaviorSubject<SortField>(SortField.xAxis);
const sortDir$ = new BehaviorSubject<SortDir>(SortDir.Asc);
const pointCmp$: Comparator$<Point> = combineLatest([
  sortField$,
  sortDir$
]).pipe(map(([sortField, sortDir]) => pointCmp(sortField, sortDir)));
const sortedPoints$ = pointsCf$.pipe(
  feedSortedList(pointCmp$, {
    // Throttle list updates to 100ms.
    // Throttle does not apply to individual list items, so
    // they still will update fast, only re-ordering add/removal is throttled
    throttleTime: 100
  })
);

/**
 * RENDER HTML
 */
const context = new Context();

render(
  Index(context, {
    input: Input(context, {
      updatesPerSec$,
      numOfPoints$,
      pointsCf$
    }),
    grouping: Grouping(context, groupedPoints$),
    sorting: SortedPoints(context, sortedPoints$, { sortField$, sortDir$ }),
    filtering: Filtering(context, {
      selectedShades$,
      selectedQuarters$,
      filteredPoints$
    })
  }),
  document.getElementById("root")!
);
