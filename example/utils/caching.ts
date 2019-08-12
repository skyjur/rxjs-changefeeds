const cache = new WeakMap();

export const weakCache: <T>(target: any, cacheKey: any, f: () => T) => T = (
  target,
  cacheKey,
  f
) => {
  if (!cache.has(target)) {
    cache.set(target, new Map());
  }
  const cacheMap = cache.get(target);
  if (cacheMap.has(cacheKey)) {
    return cacheMap.get(cacheKey);
  } else {
    const value = f();
    cacheMap.set(cacheKey, value);
    return value;
  }
};

export const memoize: <T extends Function>(
  options: { size?: number },
  f: T
) => T = ({ size = 1000 }, f) => {
  const cache = new Map();
  const access = new Map();
  return ((key: any) => {
    if (cache.has(key)) {
      access.set(key, access.get(key) + 1);
      return cache.get(key);
    } else {
      if (cache.size >= size * 1.5) {
        const keys = Array.from(access.keys()).sort(
          (a, b) => access.get(a) - access.get(b)
        );
        for (const key of keys.slice(0, Math.floor(size * 0.5))) {
          cache.delete(key);
          access.delete(key);
        }
      }
      const value = f(key);
      cache.set(key, value);
      access.set(key, 1);
      return value;
    }
  }) as any;
};
