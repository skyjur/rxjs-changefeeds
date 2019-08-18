import { MultiPointsCf } from "./data/feedGenerator";
import { BehaviorSubject } from "rxjs";
import { render } from "lit-html";
import { context } from "./html/Context";
import { Index } from "./html";
import { map, share } from "rxjs/operators";
import { allShades, Shade, rxOpReactiveShadeFilter } from "./data/shade";
import {
  allQuarters,
  Quarter,
  rxOpReactiveQuarterFilter,
  groupPointsByQuarter
} from "./data/quarter";
import { Input } from "./html/sections/input";
import { Grouping } from "./html/sections/grouping";
import { SortedPoints } from "./html/sections/sorting";
import { feedSortedList } from "../../src/operators/feedSortedList";
import { Filtering } from "./html/sections/filtering";

const updatesPerSec$ = new BehaviorSubject(20);
const updateInterval = updatesPerSec$.pipe(map(val => 1000 / val));
const numOfPoints$ = new BehaviorSubject(12);
const pointsCf$ = MultiPointsCf(numOfPoints$, updateInterval).pipe(share());

// grouping:
const groupedPoints$ = groupPointsByQuarter(pointsCf$);

// sorting:
const sortedPoints$ = pointsCf$.pipe(
  feedSortedList((a, b) => a.x - b.x, {
    throttleIntervalTime: 100
  })
);

// filtering:
const selectedShades$ = new BehaviorSubject<Shade[]>(allShades);
const selectedQuarters$ = new BehaviorSubject<Quarter[]>(allQuarters);
const filteredPoints$ = pointsCf$.pipe(
  rxOpReactiveShadeFilter(selectedShades$),
  rxOpReactiveQuarterFilter(selectedQuarters$)
);

render(
  Index(context, {
    input: Input(context, {
      updatesPerSec$,
      numOfPoints$,
      pointsCf$
    }),
    grouping: Grouping(context, groupedPoints$),
    sorting: SortedPoints(context, sortedPoints$),
    filtering: Filtering(context, {
      selectedShades$,
      selectedQuarters$,
      filteredPoints$
    })
  }),
  document.getElementById("root")!
);
