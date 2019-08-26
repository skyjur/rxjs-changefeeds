import { Operator, OperatorFunction } from "rxjs";
import { map } from "rxjs/operators";
import { ChangeFeed } from "../types";

export const feedMapValues = <Key, Value, MappedValue>(
  p: (value: Value) => MappedValue
): OperatorFunction<ChangeFeed<Key, Value>, ChangeFeed<Key, MappedValue>> =>
  map(record => {
    if (record[0] === "set") {
      return ["set", record[1], p(record[2])];
    } else {
      return record;
    }
  });
