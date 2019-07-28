export const cmpValues = (a: any, b: any) =>
    a < b ? -1 : (a > b ? 1 : 0);

export const cmpBy = <T>(key: (v: T) => any) =>
    (a: T, b: T) =>
        cmpValues(key(a), key(b))