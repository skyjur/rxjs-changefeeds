import { deepEqual } from "assert";
import { TestScheduler } from "rxjs/testing";
import { ChangeFeed, ChangeFeed$ } from "../types";
import { feedFilter } from "./feedFilter";

describe("operators/feedFilter", () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler(deepEqual);
  })

  it("initializing/ready", () => {
    scheduler.run(({ expectObservable }) => {
      const values: { [key: string]: ChangeFeed<any> } = {
        a: ["initializing"],
        b: ["ready"],
      };
      const input: ChangeFeed$<any> = scheduler.createColdObservable("ab", values);
      const output = input.pipe(feedFilter(() => false));
      expectObservable(output).toBe("ab", values);
    });
  });

  it("set/delete filter", () => {
    scheduler.run(({ expectObservable }) => {
      const values: { [key: string]: ChangeFeed<number> } = {
        a: ["set", "1", 1],
        b: ["set", "2", 2],
        c: ["del", "1"],
        d: ["del", "2"],
      };
      const input: ChangeFeed$<number> = scheduler.createColdObservable<ChangeFeed<number>>("abcd", values);
      const output = input.pipe(feedFilter((obj) => obj < 2));
      expectObservable(output).toBe("a-c-", values);
    });
  });

  it("update triggers delete", () => {
    scheduler.run(({ expectObservable }) => {
      const input = scheduler.createColdObservable<ChangeFeed<number>>("abc", {
        a: ["set", "1", 1],
        b: ["set", "1", 2],
        c: ["set", "1", 1],
      });
      const output = input.pipe(feedFilter((obj) => obj < 2));
      expectObservable(output).toBe("abc", {
        a: ["set", "1", 1],
        b: ["del", "1"],
        c: ["set", "1", 1],
      });
    });
  });
});
