import { TestScheduler } from "rxjs/testing";
import { deepStrictEqual } from "assert";
import { ChangeFeed } from "../types";
import { feedGroupBy } from "./feedGroupBy";
import { map, take, mergeMap } from "rxjs/operators";
import { of } from "rxjs";

describe("operators/feedGroupBy", () => {
  it("Only unique groups trigger event", () => {
    const scheduler = new TestScheduler(deepStrictEqual);
    scheduler.run(({ expectObservable }) => {
      const input$ = scheduler.createHotObservable<ChangeFeed<number>>("abc|", {
        a: ["set", "a", 1],
        b: ["set", "b", 2],
        c: ["set", "c", 3]
      });

      const output$ = input$.pipe(
        feedGroupBy<number, number>(n => n % 2),
        map(groups => Array.from(groups.keys()).sort())
      );

      expectObservable(output$).toBe("ab-|", {
        a: [1],
        b: [0, 1]
      });
    });
  });

  it("Group is removed when last element is removed", () => {
    const scheduler = new TestScheduler(deepStrictEqual);
    scheduler.run(({ expectObservable }) => {
      const input$ = scheduler.createHotObservable<ChangeFeed<number>>("abc|", {
        a: ["set", "a", 1],
        b: ["set", "b", 2],
        c: ["del", "a"]
      });

      const output$ = input$.pipe(
        feedGroupBy<string, number>(n => (n % 2 ? "odd" : "even")),
        map(groups => Array.from(groups.keys()).sort())
      );

      expectObservable(output$).toBe("abc|", {
        a: ["odd"],
        b: ["even", "odd"],
        c: ["even"]
      });
    });
  });

  it("Group is removed and new group is created when element is updated", () => {
    const scheduler = new TestScheduler(deepStrictEqual);
    scheduler.run(({ expectObservable }) => {
      const input$ = scheduler.createHotObservable<ChangeFeed<number>>("a-b", {
        a: ["set", "a", 1],
        b: ["set", "a", 2]
      });

      const output$ = input$.pipe(
        feedGroupBy<string, number>(n => (n % 2 ? "odd" : "even")),
        map(groups => Array.from(groups.keys()).sort())
      );

      expectObservable(output$).toBe("a-(bc)", {
        a: ["odd"],
        b: [],
        c: ["even"]
      });
    });
  });

  it("Item is removed when updated from group changefeed", () => {
    const scheduler = new TestScheduler(deepStrictEqual);
    scheduler.run(({ expectObservable }) => {
      const input$ = scheduler.createHotObservable<ChangeFeed<number>>(
        "a-b-c|",
        {
          a: ["set", "a", 1],
          b: ["set", "b", 1],
          c: ["set", "a", 2]
        }
      );

      const odd$ = input$.pipe(
        feedGroupBy<string, number>(n => (n % 2 ? "odd" : "even")),
        mergeMap(groups => groups.get("odd") || of())
      );

      expectObservable(odd$).toBe("a-b-c|", {
        a: ["set", "a", 1],
        b: ["set", "b", 1],
        c: ["del", "a"]
      });
    });
  });
});
