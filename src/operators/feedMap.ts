import { Operator, OperatorFunction } from "rxjs";
import { map } from "rxjs/operators";
import { ChangeFeed } from "../types";

export function feedMapValues<Value, MappedValue, Key = any>(
  p: (value: Value) => MappedValue
): OperatorFunction<ChangeFeed<Value, Key>, ChangeFeed<MappedValue, Key>> {
  return map(record => {
    if (record[0] === "set") {
      return ["set", record[1], p(record[2])];
    } else {
      return record;
    }
  });
}
