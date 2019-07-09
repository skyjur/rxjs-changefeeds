# rx-js-changefeeds

Collection of helpers to work with changefeeds.

## What are changefeeds?

Changefeeds are streams of object updates and deletes, it looks like this:

```js
[
    ["initializing"],  // initial data is loading
    ["set", {"id": "1", "name": "Tom"}],
    ["set", {"id": "2", "name": "Peter"}],
    ["ready"],  // all initial data has loaded
    ["set", {"id": "1", "name": "John"}],  // Tom has changed name to John
    ["set", {"id": "3", "name": "Merry"}], // new user Merry was created
    ["del", {"id": "2"}]  // Peter was deleted
]
```

# API

## ChangeFeedIndex

## Operators

### feedCombine

Like rxjs [combineLatest](https://www.learnrxjs.io/operators/combination/combinelatest.html) but combines relevant objects using id field.

```

```