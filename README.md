# rxjs-changefeed

[![CircleCI](https://circleci.com/gh/skyjur/rxjs-changefeeds/tree/master.svg?style=svg)](https://circleci.com/gh/ReactiveX/rxjs/tree/master)
[![npm version](https://badge.fury.io/js/rxjs-changefeeds.svg)](https://badge.fury.io/js/rxjs-changefeeds)

RxJS helpers to build things on top of changefeeds.

Api docs: [bellow](#API)
Example: [demo](https://skyjur.github.io/rxjs-changefeeds/example), [code](example/moving-dots/index.ts)

### What are changefeeds?

Changefeed is a log of `set <key> <value>` and `del <key> <value>` operations. This allows to represent a collection as observable in efficient way.

Many modern databases come with built in support for changefeeds: [CouchDb](https://docs.couchdb.org/en/2.2.0/api/database/changes.html), [RethinkDB](https://rethinkdb.com/docs/changefeeds/javascript/), [MongoDB](https://www.mongodb.com/blog/post/an-introduction-to-change-streams).

<a name="changefeed"></a>

## Change feed data model

```ts
type ChangeFeed<Key, Value> =
  | ["initializing"]
  | ["ready"]
  | ["set", Key, Value]
  | ["del", Key];
```

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

Value operations:

- `set <key> <value>`:
  value is added to collection or updated

- `del <key>`: value is removed from collection

Optional state operations:

- `initializing` and `ready` does not effect behavior - they are useful when loading indicator is wished. We don't do much about it in this library except for passing them through.

# API

## RxJS Operators

Methods bellow return [`OperatorFunction<Input, Output>`](https://rxjs-dev.firebaseapp.com/api/index/interface/OperatorFunction)

To learn more check [rxjs operators guide](https://rxjs-dev.firebaseapp.com/guide/operators).

### `feedFilter( FilterFunction )`

Filters changefeed values using `FilterFunction`. [demo](https://skyjur.github.io/rxjs-changefeeds/example/#feedFilter)

- _FilterFunction_:
  - `(value: Value) => boolean` or
  - `Observable<FilterFunction>`
- _Input_: [`ChangeFeed<Key, Value>`](#changefeed)
- _Output_: [`ChangeFeed<Key, Value>`](#changefeed)

Will transforms `set` events to `del` when old value pass filter but new value does not.

Can take observable filter function. When used with observable filter and filter changes, new filter is applied to all values again and `set`/`del` events re-emitted.

Example, using static filter function:

```js
import { Subject } from "rxjs";
import { feedFilter } from "rxjs-changefeeds";

const filter = value => value < 2;
const input = new Subject();
const output = input.pipe(feedFilter(filter)).subscribe(console.log);

input.next(["set", "x", 1]);
// output: ["set","x",1]

input.next(["set", "y", 2]);
// no output

input.next(["set", "x", 2]);
// output: ["del","x"]
```

Example with observable filter function. Notice how only necessary updates are broadcasted after filter value changes.

```js
import { BehaviorSubject, Subject } from "rxjs";
import { feedFilter } from "rxjs-changefeeds";

const filter = new BehaviorSubject(value => value < 3);

const input = new Subject();
const result = input.pipe(feedFilter(filter));
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

### `feedGroupBy( KeyFunction )`

Group changefeed using keyFunction into separate change feeds. [demo](https://skyjur.github.io/rxjs-changefeeds/example/#feedGroupBy)

- _KeyFunction_: `(Value, Key) => GroupKey`
- _Input_: `ChangeFeed<Key, Value>`
- _Output_: `ChangeFeed<GroupKey, Observable<Input>>` utput result is change feed where each key is result of `keyFunction` and each value is initial changefeed filtered using `keyFunction`

Notes:

When `set` event on existing item in `Input` results in different `GroupKey` than before, this will trigger two events:

1. `del` event in old group
2. `set` in new group

When there are no more items left in a group, group's observable completes.

If `initializing` and `ready` are used they will be passed through to all groups. If `ready` was received by input and new group is created, `ready` event is triggered to newly created group.

Example:

```js
import { Subject } from "rxjs";
import { mergeMap, map, tap } from "rxjs/operators";
import { feedGroupBy } from "rxjs-changefeeds";

const input = new Subject();

const getKey = num => (num % 2 ? "odd" : "even");

const output = input.pipe(feedGroupBy(getKey));

output.subscribe({
  next(record) {
    const [op, groupKey, groupChanges$] = record;
    console.log("outer:", op, groupKey);
    if (op === "set") {
      groupChanges$.subscribe({
        next(record) {
          console.log(`inner[${groupKey}]:`, record);
        },
        complete() {
          console.log(`inner[${groupKey}]: complete.`);
        }
      });
    }
  },
  complete() {
    console.log("outer: complete.");
  }
});

input.next(["set", "x", 1]);
// output:
// outer: set odd
// inner[odd]: ["set","x",1]

input.next(["set", "y", 2]);
// output:
// outer: set even
// inner[even]: ["set","y",2]

input.next(["set", "x", 2]);
// output:
// inner[odd]: ["del","x"]
// inner[odd]: complete.
// outer: del odd
// inner[even]: ["set","x",2]

input.complete();
// output:
// outer: complete.
// inner[even]: complete.
```

### `feedSortedList( Comparator, Options? )`

Transform changefeed into sorted array where each item in the array is an Observable (with additional `key` property) of the `Value`. [demo](https://skyjur.github.io/rxjs-changefeeds/example/#feedSortedList)

- _Comparator_: used for sorting the array
  - `(a: Value, b: Value) => number` or
  - `Observable<Comparator>`
- _Input_: `ChangeFeed<Key¸ Value>`
- _Output_: `Array<Observable<Value> & {key: Key}>`
- _Options_: optional object of parameters:
  - `throttleTime`: default `100`. Throttles _Output_ and re-sorting. Use `null` to disable throttling and trigger update synchronously.
  - `scheduler`: default `asyncScheduler`, not used when `throttleTime: null`

Notes:

Output only fires events when sort is effected: when new value arrives in input, first it's compared against it's siblings, if equality `left <= value <= right` is maintained, then re-sorting does not happen.

Example:

```js
import { Subject, queueScheduler, of, list } from "rxjs";
import { mergeMap, map, tap, distinct } from "rxjs/operators";
import { feedSortedList } from "rxjs-changefeeds";

const input = new Subject();

const list$ = input.pipe(
  feedSortedList((a, b) => a - b, {
    // for demo purpose we change
    throttleTime: null
  })
);

// Log sorted list:
list$.subscribe({
  next(list) {
    console.log("list:", list.map(value$ => value$.key));
  },
  complete() {
    console.log("list: complete");
  }
});

// Log inner values:
const flatValues$ = list$.pipe(
  mergeMap(list => of(...list)),
  distinct()
);

flatValues$.subscribe({
  next(value$) {
    value$.subscribe({
      next(value) {
        console.log(`inner[${value$.key}]:`, value);
      },
      complete() {
        console.log(`inner[${value$.key}]: complete.`);
      }
    });
  }
});

input.next(["set", "x", 1]);
// output:
// list: ["x"]
// inner[x]: 1

input.next(["set", "y", 2]);
// output:
// list: ["x","y"]
// inner[y]: 2

// If order does not change no list update is triggered:
input.next(["set", "y", 3]);
// output:
// inner[y]: 3

// deletion completes value observable and removes it from list:
input.next(["del", "x"]);
// output:
// list: ["y"]
// inner[x]: complete.
```

### `feedToKeyValueMap()`

Flatten change feed to `new Map()`

- _Input_: `ChangeFeed<Key, Value>`
- _Output_: `Map<Key, Value>`

```js
import { Subject, queueScheduler, of, list } from "rxjs";
import { mergeMap, map, tap, distinct } from "rxjs/operators";
import { feedToKeyValueMap } from "rxjs-changefeeds";

const input = new Subject();

input
  .pipe(
    feedToKeyValueMap(),
    map(keyValues => Array.from(keyValues.entries()))
  )
  .subscribe(console.log);

input.next(["set", "x", 1]);
// output: [["x",1]]

input.next(["set", "y", 2]);
// output: [["x",1],["y",2]]

input.next(["set", "x", 3]);
// output: [["x",3],["y",2]]

input.next(["del", "x"]);
// output: [["y",2]]
```

## Combiners

### `feedCombine(Inputs, ProjectFunction)`

Merge multiple chagnefeeds into one based on `key`.

- _Inputs_: array of input change feeds<br>
  `[Observable<ChangeFeed<Key, Value1>>, ... ,`<br>
  &nbsp;`Observable<ChangeFeed<Key, ValueN>>]`
- _ProjectFunction_: combiner producing values for output changefeed<br>
  `(v1: Value1, ... , vN: ValueN) => Project`
- _Returns_: `ChangeFeed<Key, Project>`

Notes:

`ProjectFunction` is called with latest value of each change feed in `Inputs` array. When value is not available any of input change feed `valueN` parameter will be `undefined`.

If `ProjectFunction` returns `undefined`:

- no event is emitted, if `ProjectFunction` was not called for this key before or if previous call resulted in `null`
- `del <key>` is emitted, if `ProjectFunction` previously had returned value

Example:

```js
import { Subject } from "rxjs";
import { feedCombine } from "rxjs-changefeeds";

const a$ = new Subject();
const b$ = new Subject();

const project = (a, b) => ({ a, b });

const result = feedCombine([a$, b$], project);

result.subscribe(console.log);

a$.next(["set", "x", "ax"]);
a$.next(["set", "y", "ay"]);
// output:
// ["set","x",{"a":"ax"}]
// ["set","y",{"a":"ay"}]

b$.next(["set", "x", "bx"]);
// ["set","x",{"a":"ax","b":"bx"}]

a$.next(["del", "x"]);
// ["set","x",{"b":"by"}]

b$.next(["del", "x"]);
// ["del","x"]
```

## Subjects

### `new ChangeFeedReplaySubject()`

Useful when necessary to convert from hot changefeed to cold changefeed.

Similar to [ReplaySubject](https://www.learnrxjs.io/subjects/replaysubject.html), but replays only last record per key.

If input item is deleted with `del`, then it's removed from `ChangeFeedReplaySubject` internal state and won't trigger any events in subsequent subscribers.

```js
import { ChangeFeedReplaySubject } from "rxjs-changefeeds";

const subject = new ChangeFeedReplaySubject();

subject.subscribe({
  next(val) {
    console.log("A:", val);
  }
});

subject.next(["set", 1, "one"]);
subject.next(["set", 2, "two"]);
subject.next(["set", 1, "onePlus"]);
// output:
// A: ["set",1,"one"]
// A: ["set",2,"two"]
// A: ["set",1,"onePlus"]

subject.subscribe({
  next(val) {
    console.log("B:", val);
  }
});
// output:
// B: ["set",1,"onePlus"]
// B: ["set",2,"two"]

subject.next(["del", 1]);
// output:
// A: ["del",1]
// B: ["del",1]

subject.subscribe({
  next(val) {
    console.log("C:", val);
  }
});
// output:
// C: ["set",2,"two"]
```
