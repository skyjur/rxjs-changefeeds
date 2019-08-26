// import { deepStrictEqual } from 'assert'
import { deepStrictEqual } from "assert";
import { TestScheduler } from "rxjs/testing";
import { ChangeFeedIndex } from "./ChangeFeedIndex";
import { ChangeFeed } from "./types";
import { Observable } from "rxjs";

describe("ChangeFeedIndex", () => {
  type TestCf = ChangeFeed<string, string>;
  type TestCf$ = Observable<TestCf>;
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler(deepStrictEqual);
  });

  it("simple set", async () => {
    scheduler.run(({ flush, expectObservable }) => {
      const index = new ChangeFeedIndex(scheduler);
      index.next(["set", "1", "One"]);
      expectObservable(index.get("1")!).toBe("a", {
        a: "One"
      });
    });
  });

  it("simple not found", async () => {
    scheduler.run(({ flush, expectObservable }) => {
      const index = new ChangeFeedIndex(scheduler);
      index.next(["ready"]);
      expectObservable(index.get("1")!).toBe("a", {
        a: null
      });
    });
  });

  it("not found after ready", async () => {
    scheduler.run(({ expectObservable }) => {
      const index = new ChangeFeedIndex(scheduler);
      const feed$ = scheduler.createColdObservable<TestCf>("a-b", {
        a: ["initializing"],
        b: ["ready"]
      });
      feed$.subscribe(index);
      expectObservable(index.get("1")!).toBe("--a", {
        a: null
      });
    });
  });

  it("set & delete sequence", () => {
    scheduler.run(({ hot, expectObservable }) => {
      const index = new ChangeFeedIndex(scheduler);

      hot<TestCf>("-a-b", {
        a: ["set", "1", "One1"],
        b: ["del", "1"]
      }).subscribe(index);

      expectObservable(index.get("1")).toBe("-a-b", {
        a: "One1",
        b: null
      });
    });
  });
});
