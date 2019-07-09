import { TestScheduler } from "rxjs/testing";
import { ChangeFeed$ } from "../types";
import { sortedChangeFeedIds } from "./sortedIds";

const { deepEqual } = require("assert");

describe("changefeed.operators.sortedIds", () => {
  const scheduler = new TestScheduler(deepEqual);

  describe("sortedIds()", () => {
    it("update existing", () => {
      scheduler.run(({ expectObservable }) => {

        const input: ChangeFeed$<any> = scheduler.createColdObservable("abc---d", {
          a: ["set", { id: "1", value: 101 }],
          b: ["set", { id: "2", value: 100 }],
          c: ["set", { id: "3", value: 102 }],
          d: ["set", { id: "2", value: 103 }],
        });

        const output = input.pipe(
          sortedChangeFeedIds((a, b) => a.value - b.value, { freq: 1 }),
        );

        expectObservable(output).toBe("---a---b", {
          a: ["2", "1", "3"],
          b: ["1", "3", "2"],
        });
      });
    });

    it("delete", () => {
      scheduler.run(({ expectObservable }) => {
        const input: ChangeFeed$<any> = scheduler.createColdObservable("ab---d", {
          a: ["set", { id: "1", value: 100 }],
          b: ["set", { id: "2", value: 101 }],
          c: ["del", { id: "1" }],
        });

        const output = input.pipe(
          sortedChangeFeedIds((a, b) => a.value - b.value, { rate: 1 }),
        );

        expectObservable(output).toBe("--a---b", {
          a: ["1", "2"],
          b: ["2"],
        });
      });
    });
  });
});
