import { of, Observable } from "rxjs";
import { map, mergeMap, take } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";
import { ChangeFeed$, ChangeFeed } from "../types";
import { feedToObservablesMap } from "./feedToObservablesMap";
import { number$ } from "../_internal/types";

const { deepStrictEqual } = require("assert");

describe("changefeed.operators.feedToMap", () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler(deepStrictEqual);
  });

  describe("sortedIds()", () => {
    type TestCf = ChangeFeed<string, number>;
    type TestCf$ = Observable<TestCf>;

    it("value update", () => {
      scheduler.run(({ expectObservable }) => {
        const input: TestCf$ = scheduler.createColdObservable("a-b|", {
          a: ["set", "1", 101],
          b: ["set", "1", 102]
        });

        const output = input.pipe(feedToObservablesMap());

        const values = output.pipe(mergeMap(data => data.get("1")!));

        expectObservable(values).toBe("a-b|", {
          a: 101,
          b: 102
        });
      });
    });

    it("deleting key completes observable", () => {
      scheduler.run(({ expectObservable }) => {
        const input: TestCf$ = scheduler.createColdObservable("ab|", {
          a: ["set", "1", 101],
          b: ["del", "1"]
        });

        const output = input.pipe(feedToObservablesMap());

        const values = output.pipe(
          mergeMap(data => data.get("1")! || of<number>())
        );

        expectObservable(values).toBe("a-|", {
          a: 101
        });
      });
    });

    it("keys added", () => {
      scheduler.run(({ expectObservable }) => {
        const input: TestCf$ = scheduler.createColdObservable("a-b-|", {
          a: ["set", "1", 101],
          b: ["set", "2", 102]
        });

        const output = input.pipe(feedToObservablesMap());

        const keys = output.pipe(map(data => Array.from(data.keys())));

        expectObservable(keys).toBe("a-b-|", {
          a: ["1"],
          b: ["1", "2"]
        });
      });
    });

    it("keys deleted", () => {
      scheduler.run(({ expectObservable }) => {
        const input: TestCf$ = scheduler.createColdObservable("ab", {
          a: ["set", "1", 101],
          b: ["del", "1"]
        });

        const output = input.pipe(feedToObservablesMap());

        const keys = output.pipe(map(data => Array.from(data.keys())));

        expectObservable(keys).toBe("ab", {
          a: ["1"],
          b: []
        });
      });
    });

    it("when no keys added/removed not event triggered", () => {
      scheduler.run(({ expectObservable }) => {
        const input: TestCf$ = scheduler.createColdObservable("ab", {
          a: ["set", "1", 101],
          b: ["set", "1", 103]
        });

        const output = input.pipe(feedToObservablesMap());

        const keys = output.pipe(map(data => Array.from(data.keys())));

        expectObservable(keys).toBe("a", {
          a: ["1"]
        });
      });
    });
  });
});
