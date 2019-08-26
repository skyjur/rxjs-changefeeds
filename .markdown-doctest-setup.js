require("ts-node/register/transpile-only");
const { deepStrictEqual } = require("assert");
const stack = [];

module.exports = {
  require: {
    rxjs: require("rxjs"),
    "rxjs/operators": require("rxjs/operators"),
    "rxjs-changefeeds": require(".")
  },
  globals: {
    exports: {}
  }
};
