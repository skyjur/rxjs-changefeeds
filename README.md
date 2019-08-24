# rxjs-changefeed

Rxjs helpers to build things on top of changefeeds.

Api docs: [bellow](#API)
Example: [demo](https://skyjur.github.io/rxjs-changefeeds/example), [code](example/moving-dots/index.ts)

### What are changefeeds?

Changefeed is a log of `set <key> <value>` and `del <key> <value>` operations. This allows to express a collection of objects as observable in an efficient way.

Many modern databases come with built in suppory for changefeeds: [CouchDb](https://docs.couchdb.org/en/2.2.0/api/database/changes.html), [RethinkDB](https://rethinkdb.com/docs/changefeeds/javascript/), [MongoDB](https://www.mongodb.com/blog/post/an-introduction-to-change-streams).

## Data model

Example:

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

# API

## operators/feedFilter

Transforms observable changfeed into filtered changefeed.

Will transforms `set` events to `del` when old value pass filter but new value does not.

Can take observable filter function.

Example, using static filter function:

```js
import { Subject } from "rxjs";
import { feedFilterRx } from "rxjs-changefeeds";

const filter = value => value < 2;
const input = new Subject();
const output = input.pipe(feedFilterRx(filter)).subscribe(console.log);

input.next(["set", "x", 1]);
// output: ["set","x",1]

input.next(["set", "y", 2]);
// no output

input.next(["set", "x", 2]);
// output: ["del","x"]
```

Example with observable filter function. Notice how only necessary updates are boradcasted after filter value changes.

```js
import { BehaviorSubject, Subject } from "rxjs";
import { feedFilterRx } from "rxjs-changefeeds";

const filter = new BehaviorSubject(value => value < 3);

const input = new Subject();
const result = input.pipe(feedFilterRx(filter));
result.subscribe(console.log);

input.next(["set", "one", 1]);
input.next(["set", "two", 2]);
input.next(["set", "three", 3]);
// output:
// ["set","one",1]
// ["set","two",2]

filter.next(value => value > 1);
// output:
// ["del","one"]
// ["set","three",3]
```

Note that when input observable completes, result also completes and filter is unsubscribed.

## operators/feedGroupBy

Signature: `feedGroupBy( keyFunction: (value, key) => GroupKey )`

Splits changefeed into multiple changefeeds using key function. Result is:

    Map<GroupKey, Observable<ChangeFeed>>

When `set` event has effect on previous group key, it triggers two events:

1. `del` event in old group.
2. `set` in new group

When there are no more items left in a group, group's observable completes.

```js
import { Subject } from "rxjs";
import { mergeMap, map, do } from "rxjs/operators";
import { feedGroupBy } from "rxjs-changefeeds";

const input = new Subject();

const result = input.pipe(feedGroupBy(num => (num % 2 ? "odd" : "even")));

result.pipe(
  do(groups => console.log("keys:", ...groups.keys())),
 mergeMap(groups => [...groups.entries()]),
 
)

input.next(["set", "x", 1]);
// output:
// keys: odd
// odd: ["set","x",1]

input.next(["set", "y", 2]);
// output:
// keys: odd even
// even: ["set","y",2]

input.next(["set", "x", 2]);
// output:
// odd: ["del","x"]
// even: ["set","x",2]
// keys: even
```

## operators/feedCombine

`- feedCombine`

Like rxjs [combineLatest](https://www.learnrxjs.io/operators/combination/combinelatest.html) but combines relevant objects using id field.

```

```

## ChangeFeedReplay

Useful when necessary to convert from hot changefeed to cold changefeed.

Similar to [ChangeFeedReplay](https://www.learnrxjs.io/subjects/replaysubject.html), but replays only last record per key.

```es6
import { ChangeFeedReplaySubject } from "rxjs-changefeeds";

const subject = new ChangeFeedReplaySubject();

subject.next(["set", 1, "one"]);
subject.next(["set", 2, "two"]);
subject.next(["set", 1, "onePlus"]);

subject.subscribe(console.log);
// output:
// ["set",1,"onePlus"]
// ["set",2,"two"]
```
