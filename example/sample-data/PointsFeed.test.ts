import { TestScheduler } from "rxjs/testing";
import { deepStrictEqual as eq, ok } from "assert";
import { SinglePointFeed, MultiPointsCf, PointCf, Point } from "./PointsFeed";
import { map } from "rxjs/operators";
import { of } from "rxjs";
import {
  AnyChangeFeed,
  AnyChangeFeed$,
  AnyChangeFeedValues
} from "../../src/_internal/types";

describe("sample-data/PointFeed", () => {
  describe("singlePointFeed", () => {
    it("Generates random points", () => {
      new TestScheduler(eq).run(({ hot, expectObservable }) => {
        const result = SinglePointFeed(hot("a-b--c", {}), {
          random: () => 0.5
        }).pipe(
          map(point => {
            eq(point[0], "set");
            ok(point[1]);
            eq(typeof point[2], "object");
            eq(typeof point[2]!.id, "string");
            eq(typeof point[2]!.color, "string");
            eq(typeof point[2]!.x, "number");
            eq(typeof point[2]!.y, "number");
          })
        );

        expectObservable(result).toBe("a-b--c", {});
      });
    });

    it("Deletes and creates new points", () => {
      new TestScheduler(eq).run(({ hot, expectObservable }) => {
        const keys: any[] = [];
        const result = SinglePointFeed(hot("a-b-c-d", {}), {
          random: () => 0.000001
        }).pipe(
          map(point => {
            const [cmd, key] = point;
            keys.push(key);
            return [cmd, keys.indexOf(key)];
          })
        );

        expectObservable(result).toBe("a-b-c-d", {
          a: ["set", 0],
          b: ["del", 0],
          c: ["set", 2],
          d: ["del", 2]
        });
      });
    });
  });

  describe("MultiPointsCf", () => {
    it("Single point", () => {
      new TestScheduler(eq).run(({ hot, expectObservable }) => {
        const PointFeedMock = () =>
          hot<AnyChangeFeed>("-a-b-|", {
            a: ["set", "a", 1],
            b: ["set", "a", 2]
          });

        const result: AnyChangeFeed$ = MultiPointsCf(
          hot("a", { a: 1 }),
          PointFeedMock
        );

        expectObservable(result).toBe("a-(bc)-d-|", {
          a: ["initializing"],
          b: ["set", "a", 1],
          c: ["ready"],
          d: ["set", "a", 2]
        } as AnyChangeFeedValues);
      });
    });
  });
});
