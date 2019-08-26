import { TestScheduler } from "rxjs/testing";
import { deepStrictEqual, deepEqual } from "assert";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { feedGroupBy } from "./feedGroupBy";
import {
  map,
  take,
  mergeMap,
  first,
  multicast,
  switchMap
} from "rxjs/operators";
import { of, Subject, Unsubscribable } from "rxjs";

const oddEven = (n: number) => (n % 2 ? "odd" : "even");

describe("operators/feedGroupBy", () => {
  type Input$ = ChangeFeed$<"a" | "b" | "c", number>;
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler(deepStrictEqual);
  });

  it("Only unique groups trigger event", () => {
    scheduler.run(({ expectObservable }) => {
      const input$ = scheduler.createHotObservable<ChangeFeed<string, number>>(
        "abc|",
        {
          a: ["set", "a", 1],
          b: ["set", "b", 2],
          c: ["set", "c", 3]
        }
      );

      const groupKey = (n: number) => (n % 2 > 0 ? "odd" : "even");

      const output$ = input$.pipe(
        feedGroupBy(groupKey),
        map(([op, groupKey]) => [op, groupKey])
      );

      expectObservable(output$).toBe("ab-|", {
        a: ["set", "odd"],
        b: ["set", "even"]
      });
    });
  });

  it("Group is removed when last element is removed", () => {
    scheduler.run(({ expectObservable }) => {
      const input$: Input$ = scheduler.createHotObservable("abc|", {
        a: ["set", "a", 1],
        b: ["set", "b", 2],
        c: ["del", "a"]
      });

      const output$ = input$.pipe(
        feedGroupBy(oddEven),
        map(([op, groupKey]) => [op, groupKey])
      );

      expectObservable(output$).toBe("abc|", {
        a: ["set", "odd"],
        b: ["set", "even"],
        c: ["del", "odd"]
      });
    });
  });

  it("Group is removed and new group is created when element is updated", () => {
    scheduler.run(({ expectObservable }) => {
      const input$: Input$ = scheduler.createHotObservable("a-b", {
        a: ["set", "a", 1],
        b: ["set", "a", 2]
      });

      const output$ = input$.pipe(
        feedGroupBy(oddEven),
        map((op, key) => [op, key])
      );

      expectObservable(output$).toBe("a-(bc)", {
        a: ["set", "odd"],
        b: ["del", "odd"],
        c: ["set", "even"]
      });
    });
  });

  it("Item is removed when updated from group changefeed", () => {
    scheduler.run(({ hot, expectObservable }) => {
      const input$: Input$ = hot("a-b-c|", {
        a: ["set", "a", 1],
        b: ["set", "b", 1],
        c: ["set", "a", 2]
      });

      const odd$ = new Subject();
      let oddSub: Unsubscribable;

      input$.pipe(feedGroupBy(oddEven)).subscribe({
        next([op, groupKey, group$]) {
          if (op === "set" && groupKey === "odd") {
            oddSub = group$!.subscribe(odd$);
          }
        }
      });

      expectObservable(odd$).toBe("a-b-c|", {
        a: ["set", "a", 1],
        b: ["set", "b", 1],
        c: ["del", "a"]
      });
    });
  });
});
