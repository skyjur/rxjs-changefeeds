const { deepStrictEqual } = require("assert");
const stack = [];

module.exports = {
  require: {
    rxjs: require("rxjs"),
    "rxjs-changefeeds": require("./dist")
  },
  globals: {
    _push: val => stack.push(val),
    _expect: val => {
      deepStrictEqual(stack.pop(), val);
    }
  }
};
