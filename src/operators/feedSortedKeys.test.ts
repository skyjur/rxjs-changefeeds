import { deepStrictEqual } from "assert";
import { TestScheduler } from "rxjs/testing";
import { ChangeFeed$ } from "../types";
import { feedSortedKeys } from "./feedSortedKeys";

describe("changefeed.operators.feedSortedKeys", () => {
  const scheduler = new TestScheduler(deepStrictEqual);

  describe("feedSortedKeys()", () => {
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

        const output = input.pipe(
          feedSortedKeys((a, b) => a - b, { throttleIntervalTime: 1 })
        );

        expectObservable(output).toBe("a-b-c-|", {
          a: ["1"],
          b: ["1", "2"],
          c: ["2", "1"]
        });
      });
    });

    it("value change that does not effect sorting does not trigger event", () => {
      scheduler.run(({ expectObservable }) => {
        const input: ChangeFeed$<any> = scheduler.createColdObservable(
          "a-b-c-d-e-f-|",
          {
            a: ["set", "1", 100],
            b: ["set", "2", 110],
            c: ["set", "3", 120],
            d: ["set", "1", 101],
            e: ["set", "2", 111],
            f: ["set", "3", 121]
          }
        );

        const output = input.pipe(
          feedSortedKeys((a, b) => a - b, { throttleIntervalTime: 1 })
        );

        expectObservable(output).toBe("a-b-c-------|", {
          a: ["1"],
          b: ["1", "2"],
          c: ["1", "2", "3"]
        });
      });
    });

    it("delete", () => {
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
          feedSortedKeys((a, b) => a - b, { throttleIntervalTime: 1 })
        );

        expectObservable(output).toBe("a-b-c-|", {
          a: ["1"],
          b: ["1", "2"],
          c: ["2"]
        });
      });
    });
  });
});
