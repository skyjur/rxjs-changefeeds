import { directive } from "lit-html";

interface CacheResult {
  <T>(key: any, factory: () => T): T;
  <T>(key1: any, key2: any, factory: () => T): T;
  <T>(key1: any, key2: any, factory: () => T): T;
  <T>(key1: any, key2: any, key3: any, factory: () => T): T;
  <T>(key1: any, key2: any, key3: any, key4: any, factory: () => T): T;
  <T>(
    key1: any,
    key2: any,
    key3: any,
    key4: any,
    key5: any,
    factory: () => T
  ): T;
}

export const cacheResult: CacheResult = directive(
  (...args: any[]) => (part: any) => {
    const factory = args.pop();
    if (!part._prevCacheKey || !arrayEq(part._prevCacheKey, args)) {
      part._prevCacheKey = args;
      const isFirst = part.value === undefined;
      part.setValue(factory());
      if (!isFirst) {
        part.commit();
      }
    }
  }
);

const arrayEq = (one: any, other: any) => {
  if (one.length !== other.length) {
    return false;
  }
  for (let i = 0; i < one.length; i++) {
    if (one[i] !== other[i]) {
      return false;
    }
  }
  return true;
};
