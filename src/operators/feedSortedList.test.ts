import { deepStrictEqual } from "assert";
import { TestScheduler } from "rxjs/testing";
import { ChangeFeed$, ChangeFeed } from "../types";
import { feedSortedList } from "./feedSortedList";
import { map, switchMap } from "rxjs/operators";
import { of, concat, Observable } from "rxjs";

describe("operators/feedSortedList", () => {
  type TestCf = ChangeFeed<number, "x" | "y">;
  type TestCf$ = Observable<TestCf>;
  const comparator = (a: number, b: number) => a - b;

  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler(deepStrictEqual);
  });

  it("update existing", () => {
    scheduler.run(({ expectObservable }) => {
      const input: TestCf$ = scheduler.createColdObservable("a-b-c-|", {
        a: ["set", "x", 100],
        b: ["set", "y", 101],
        c: ["set", "x", 102]
      });

      const output = input.pipe(
        feedSortedList(comparator, { throttleTime: 0, scheduler }),
        map(list => list.map(value$ => value$.key))
      );

      expectObservable(output).toBe("a-b-c-|", {
        a: ["x"],
        b: ["x", "y"],
        c: ["y", "x"]
      });
    });
  });

  it("value change that does not effect sorting does not trigger event", () => {
    scheduler.run(({ expectObservable }) => {
      const input: TestCf$ = scheduler.createColdObservable("abc|", {
        a: ["set", "x", 100],
        b: ["set", "y", 110],
        c: ["set", "x", 101]
      });

      const output = input.pipe(
        feedSortedList(comparator, { throttleTime: 0, scheduler }),
        map(list => list.map(value$ => value$.key))
      );

      expectObservable(output).toBe("ab-|", {
        a: ["x"],
        b: ["x", "y"]
      });
    });
  });

  it("item deletion removes item from list", () => {
    scheduler.run(({ expectObservable }) => {
      const input: ChangeFeed$<any> = scheduler.createColdObservable(
        "a-b-c-|",
        {
          a: ["set", "x", 100],
          b: ["set", "y", 101],
          c: ["del", "x"]
        }
      );

      const output = input.pipe(
        feedSortedList((a, b) => a - b, { throttleTime: 0, scheduler }),
        map(list => list.map(value$ => value$.key))
      );

      expectObservable(output).toBe("a-b-c-|", {
        a: ["x"],
        b: ["x", "y"],
        c: ["y"]
      });
    });
  });

  it("BehaviorSubject is updated with new values and completed on deletion", () => {
    scheduler.run(({ hot, expectObservable }) => {
      const input: ChangeFeed$<any> = hot("a-b-c-|", {
        a: ["set", "x", 100],
        b: ["set", "x", 101],
        c: ["del", "x"]
      });

      const value$ = input.pipe(
        feedSortedList((a, b) => a - b, { throttleTime: 0, scheduler }),
        switchMap(list => (list[0] ? concat(list[0], of("complete")) : of()))
      );

      expectObservable(value$).toBe("a-b-c-|", {
        a: 100,
        b: 101,
        c: "complete"
      });
    });
  });
});
