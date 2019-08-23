# rx-js-changefeeds

Collection of helpers to work with changefeeds.

Example: [demo](https://skyjur.github.io/rx-js-changefeeds/example) [code](example/moving-dots/index.ts)

## What are changefeeds?

Change feeds are streams of object mutation. They are very useful to keep always up to date with most latest remote state changes.

Changefeeds are baked in some database systems: [CouchDb](https://docs.couchdb.org/en/2.2.0/api/database/changes.html), [RethinkDB](https://rethinkdb.com/docs/changefeeds/javascript/), [MongoDB](https://www.mongodb.com/blog/post/an-introduction-to-change-streams).

Changefeeds within this library are expected to look like this:

```js
[
  ["initializing"], // initial data is loading (optional)
  ["set", "1", { id: "1", name: "Tom" }],
  ["set", "2", { id: "2", name: "Peter" }],
  ["ready"], // all initial data has loaded (optional)
  ["set", "1", { id: "1", name: "John" }], // Tom has changed name to John
  ["set", "3", { id: "3", name: "Merry" }], // new user Merry was created
  ["del", "2"] // Peter was deleted
];
```

## What does this libary do about changefeeds?

Similarly how `rxjs` comes with great set of primitives like `map()`, `filter()`, `goupBy()`, etc idea is to build efficient common primitives that solve common problems relating to transformation of changefeeds.

# API

## operators: feedFilter

Like rxjs [filter](https://www.learnrxjs.io/operators/filtering/filter.html) but will transforms `set` events to `del` when old value pass filter but new value does not.

Can take observable filter function, thus it's easy to implement reactive UIs that react to filter options.

```es6
import { Subject } from "rxjs";
import { feedFilterRx } from "rxjs-changefeeds";

const filter = value => value < 2;
const input = new Subject();
const output = input.pipe(feedFilterRx(filter)).subscribe(__push);

input.next(["set", "x", 1]);
_expect(["set", "x", 1]);

input.next(["set", "y", 2]);
_expect(undefined);

input.next(["set", "x", 2]);
_expect(["del", "x"]);
```

Observable filter example:

```es6
import { Subject, BehaviorSubject } from "rxjs";
import { feedFilterRx } from "rxjs-changefeeds";

const filter = new BehaviorSubject(value => value < 2);
const input = new Subject();
const output = input.pipe(feedFilterRx(filter)).subscribe(__push);

input.next(["set", "x", 1]);
__expect(["set", "x", 1]);

input.next(["set", "y", 2]);
__expect(undefined);

filter.next(value => value > 1);
__expect(["del", "x"]);
__expect(["set", "y", 2]);
```

## operators/feedCombine

`- feedCombine`

Like rxjs [combineLatest](https://www.learnrxjs.io/operators/combination/combinelatest.html) but combines relevant objects using id field.

```

```

## ChangeFeedReplay

Similar to [ChangeFeedReplay](https://www.learnrxjs.io/subjects/replaysubject.html), but replays only last record per key.

```es6
import { ChangeFeedReplaySubject } from "rxjs-changefeeds";

const subject = new ChangeFeedReplaySubject();

subject.next(["set", 1, "one"]);
subject.next(["set", 2, "two"]);
subject.next(["set", 1, "onePlus"]);

subject.subscribe(__push);
__expect(["set", 1, "onePlus"]);
__expect(["set", 2, "two"]);
```
