import { deepStrictEqual } from "assert";
import { ChangeFeedReplaySubject } from "./ChangeFeedReplay";
import { ChangeFeed } from "./types";

describe("changefeed.ChangeFeedReplySubject", () => {
  it("replies only last update to new subscriber", async () => {
    const subject = new ChangeFeedReplaySubject<string, string>();

    subject.next(["initializing"]);
    subject.next(["set", "1", "A"]);
    subject.next(["set", "2", "B"]);
    subject.next(["ready"]);
    subject.next(["set", "1", "A+"]);

    const out: Array<ChangeFeed<string>> = [];
    const sub = subject.subscribe(value => out.push(value));

    sub.unsubscribe();

    deepStrictEqual(out, [
      ["initializing"],
      ["set", "1", "A+"],
      ["set", "2", "B"],
      ["ready"]
    ]);
  });
});
