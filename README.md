# rx-js-changefeeds

Collection of helpers to work with changefeeds.

## What are changefeeds?

Changefeeds are streams of object updates and deletes. It's great way to synchronize database replicas or keep UI up to date with most recent info.

Changefeeds are baked in some database systems: [CouchDb](https://docs.couchdb.org/en/2.2.0/api/database/changes.html), [RethinkDB](https://rethinkdb.com/docs/changefeeds/javascript/), [MongoDB](https://www.mongodb.com/blog/post/an-introduction-to-change-streams), and if not baked in with database of choice it's straight forward enough to implement it using AMQP, Kafka or similar tools.

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

Similarly how `rxjs` comes with great set of primitives like `map()`, `filter()`, `goupBy()`, etc idea is to build efficient common primitives that solve common problems relating to transformation of changefeeds and avoiding unecessary re-renders.

## Examples & usage

Check

# API

## Subjects

- `ChangeFeedReplay`

Similar to `rxjs/ChangeFeedReplay`, but only replays last unique record (by primary key).

## Operators

`- feedCombine`

Like rxjs [combineLatest](https://www.learnrxjs.io/operators/combination/combinelatest.html) but combines relevant objects using id field.

```

```
