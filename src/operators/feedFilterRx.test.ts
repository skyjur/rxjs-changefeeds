import { of } from "rxjs";
import { deepStrictEqual } from "assert";
import { feedFilterRx } from "./feedFilterRx";
import { TestScheduler } from "rxjs/testing";
import { ChangeFeed, ChangeFeed$ } from "../types";

describe("operators/feedFilterRx", () => {
  describe("Obsercable filter", () => {
    it("only valid values pass", () => {
      const scheduler = new TestScheduler(deepStrictEqual);
      scheduler.run(({ expectObservable }) => {
        const predicate$ = of((value: number) => value <= 2);

        const values: { [key: string]: ChangeFeed<number, string> } = {
          a: ["set", "key1", 1],
          b: ["set", "key2", 2],
          c: ["set", "key3", 3]
        };

        const input$: ChangeFeed$<
          number,
          string
        > = scheduler.createColdObservable("abc|", values);

        const output: ChangeFeed$<number, string> = input$.pipe(
          feedFilterRx(predicate$)
        );

        expectObservable(output).toBe("ab-|", values);
      });
    });

    it("previously valid values are removed", () => {
      const scheduler = new TestScheduler(deepStrictEqual);
      scheduler.run(({ expectObservable }) => {
        const predicate$ = of((value: number) => value === 1);

        const values: { [key: string]: ChangeFeed<number, string> } = {
          a: ["set", "key1", 1],
          b: ["set", "key1", 2],
          d: ["del", "key1"]
        };

        const input$: ChangeFeed$<
          number,
          string
        > = scheduler.createColdObservable("ab|", values);

        const output$ = input$.pipe(feedFilterRx(predicate$));

        expectObservable(output$).toBe("ad|", values);
      });
    });

    it("updated predicate triggers del on previously included keys", () => {
      const scheduler = new TestScheduler(deepStrictEqual);
      scheduler.run(({ expectObservable }) => {
        const predicate$ = scheduler.createColdObservable("a-b-|", {
          a: (value: any) => true,
          b: (value: any) => false
        });

        const input$: ChangeFeed$<
          number,
          string
        > = scheduler.createColdObservable("a---|", {
          a: ["set", "key1", 1]
        });

        const output$ = input$.pipe(feedFilterRx(predicate$));

        expectObservable(output$).toBe("a-b-|", {
          a: ["set", "key1", 1],
          b: ["del", "key1"]
        });
      });
    });

    it("updated predicate triggers set on previously excluded values", () => {
      const scheduler = new TestScheduler(deepStrictEqual);
      scheduler.run(({ expectObservable }) => {
        const predicate$ = scheduler.createColdObservable("a-b-|", {
          a: (value: any) => false,
          b: (value: any) => true
        });

        const input$: ChangeFeed$<
          number,
          string
        > = scheduler.createColdObservable("a---|", {
          a: ["set", "key1", 1]
        });

        const output$ = input$.pipe(feedFilterRx(predicate$));

        expectObservable(output$).toBe("--a-|", {
          a: ["set", "key1", 1]
        });
      });
    });
  });

  describe("Static filter", () => {
    describe("operators/feedFilter", () => {
      let scheduler: TestScheduler;

      beforeEach(() => {
        scheduler = new TestScheduler(deepStrictEqual);
      });

      it("initializing/ready", () => {
        scheduler.run(({ expectObservable }) => {
          const values: { [key: string]: ChangeFeed<any> } = {
            a: ["initializing"],
            b: ["ready"]
          };
          const input: ChangeFeed$<any> = scheduler.createColdObservable(
            "ab",
            values
          );
          const output = input.pipe(feedFilterRx(() => false));
          expectObservable(output).toBe("ab", values);
        });
      });

      it("set/delete filter", () => {
        scheduler.run(({ expectObservable }) => {
          const values: { [key: string]: ChangeFeed<number> } = {
            a: ["set", "1", 1],
            b: ["set", "2", 2],
            c: ["del", "1"],
            d: ["del", "2"]
          };
          const input: ChangeFeed$<number> = scheduler.createColdObservable<
            ChangeFeed<number>
          >("abcd", values);
          const output = input.pipe(feedFilterRx(obj => obj < 2));
          expectObservable(output).toBe("a-c-", values);
        });
      });

      it("update triggers delete", () => {
        scheduler.run(({ expectObservable }) => {
          const input = scheduler.createColdObservable<ChangeFeed<number>>(
            "abc",
            {
              a: ["set", "1", 1],
              b: ["set", "1", 2],
              c: ["set", "1", 1]
            }
          );
          const output = input.pipe(feedFilterRx(obj => obj < 2));
          expectObservable(output).toBe("abc", {
            a: ["set", "1", 1],
            b: ["del", "1"],
            c: ["set", "1", 1]
          });
        });
      });
    });
  });
});
