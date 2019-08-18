import { deepStrictEqual } from "assert";
import { TestScheduler } from "rxjs/testing";
import { ChangeFeed$ } from "../types";
import { feedSortedList, Comparator } from "./feedSortedList";
import { map, switchMap, first, mergeMap } from "rxjs/operators";
import { of, Subject, Unsubscribable } from "rxjs";

describe("operators/feedSortedList", () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler(deepStrictEqual);
  });

  it("update existing", () => {
    scheduler.run(({ expectObservable }) => {
      const input: ChangeFeed$<any> = scheduler.createColdObservable(
        "a-b-c-|",
        {
          a: ["set", "1", 100],
          b: ["set", "2", 101],
          c: ["set", "1", 102]
        }
      );

      const comparator: Comparator<number> = (a, b) => a - b;

      const output = input.pipe(
        feedSortedList(comparator, { throttleIntervalTime: 0, scheduler }),
        map(subjects => subjects.map(subject => subject.value))
      );

      expectObservable(output).toBe("a-b-c-|", {
        a: [100],
        b: [100, 101],
        c: [101, 102]
      });
    });
  });

  it("value change that does not effect sorting does not trigger event", () => {
    scheduler.run(({ expectObservable }) => {
      const input: ChangeFeed$<any> = scheduler.createColdObservable("abc|", {
        a: ["set", "1", 100],
        b: ["set", "2", 110],
        c: ["set", "1", 101]
      });

      const output = input.pipe(
        feedSortedList((a, b) => a - b, { throttleIntervalTime: 0, scheduler }),
        map(subjects => subjects.map(subject => subject.value))
      );

      expectObservable(output).toBe("ab-|", {
        a: [100],
        b: [100, 110]
      });
    });
  });

  it("item deletion removes item from list", () => {
    scheduler.run(({ expectObservable }) => {
      const input: ChangeFeed$<any> = scheduler.createColdObservable(
        "a-b-c-|",
        {
          a: ["set", "1", 100],
          b: ["set", "2", 101],
          c: ["del", "1"]
        }
      );

      const output = input.pipe(
        feedSortedList((a, b) => a - b, { throttleIntervalTime: 0 }),
        map(subjects => subjects.map(subject => subject.value))
      );

      expectObservable(output).toBe("a-b-c-|", {
        a: [100],
        b: [100, 101],
        c: [101]
      });
    });
  });

  it("BehaviorSubject is updated with new values and completed on deletion", () => {
    scheduler.run(({ hot, expectObservable }) => {
      const input: ChangeFeed$<any> = hot("a-b-c-|", {
        a: ["set", "1", 100],
        b: ["set", "1", 101],
        c: ["del", "1"]
      });

      const sortedList$ = input.pipe(
        feedSortedList((a, b) => a - b, { throttleIntervalTime: 0 })
      );

      let one$ = new Subject();
      let oneSub: Unsubscribable;

      sortedList$.subscribe({
        next(sortedList) {
          if (!oneSub) {
            oneSub = sortedList[0].subscribe(one$);
          }
        }
      });

      expectObservable(one$).toBe("a-b-|", {
        a: 100,
        b: 101
      });
    });
  });
});
