import { memoize } from "./caching";
import { strictEqual } from "assert";

describe("uexample/utils/caching", () => {
  describe("memoize", () => {
    it("returns memoized value", () => {
      let d = { x: 1, y: 1 };
      const f = memoize({}, (k: "x" | "y") => d[k]++);
      const x1 = f("x");
      const x2 = f("x");
      const y1 = f("y");
      const y2 = f("y");
      strictEqual(x1, 1);
      strictEqual(x2, 1);
      strictEqual(y1, 1);
      strictEqual(y2, 1);
    });
  });
});
