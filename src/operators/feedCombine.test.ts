import { deepStrictEqual } from "assert";
import { TestScheduler } from "rxjs/testing";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { feedCombine2 } from "./feedCombine";

describe("operators/feedCombine", () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler(deepStrictEqual);
  });

  it("Combine set", () => {
    scheduler.run(({ flush, expectObservable }) => {
      const x$: ChangeFeed$<string> = scheduler.createColdObservable("a-", {
        a: ["set", "1", "X"]
      });
      const y$: ChangeFeed$<string> = scheduler.createColdObservable("-a", {
        a: ["set", "1", "Y"]
      });

      const product$ = feedCombine2(x$, y$, (x, y) => ({
        x,
        y
      }));

      scheduler.expectObservable(product$).toBe("ab", {
        a: ["set", "1", { x: "X", y: undefined }],
        b: ["set", "1", { x: "X", y: "Y" }]
      });
    });
  });

  it("Combined delete", () => {
    scheduler.run(({ flush, expectObservable }) => {
      const x$: ChangeFeed$<string> = scheduler.createColdObservable("a--b", {
        a: ["set", "1", "X"],
        b: ["del", "1"]
      });
      const y$: ChangeFeed$<string> = scheduler.createColdObservable("-a--b", {
        a: ["set", "1", "Y"],
        b: ["del", "1"]
      });

      const product$ = feedCombine2(x$, y$, (x, y) => ({ x, y }));

      scheduler.expectObservable(product$).toBe("ab-cd", {
        a: ["set", "1", { x: "X", y: undefined }],
        b: ["set", "1", { x: "X", y: "Y" }],
        c: ["set", "1", { x: undefined, y: "Y" }],
        d: ["del", "1"]
      });
    });
  });

  it("Project null produces delete", () => {
    scheduler.run(({ flush, expectObservable }) => {
      const x$: ChangeFeed$<string> = scheduler.createColdObservable("a-b", {
        a: ["set", "1", "X"],
        b: ["del", "1"]
      });
      const y$: ChangeFeed$<string> = scheduler.createColdObservable("-a--b", {
        a: ["set", "1", "Y"],
        b: ["del", "1"]
      });

      const product$ = feedCombine2(x$, y$, (x, y) =>
        x && y ? { x, y } : null
      );

      scheduler.expectObservable(product$).toBe("-ab", {
        a: ["set", "1", { x: "X", y: "Y" }],
        b: ["del", "1"]
      });
    });
  });
});
