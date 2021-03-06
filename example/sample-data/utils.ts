import { combineLatest, Observable, NEVER, interval, of } from "rxjs";
import { switchMap, delay, repeat, mergeMap } from "rxjs/operators";

export const controlledInterval = ({
  pause$,
  interval$
}: {
  pause$: Observable<boolean>;
  interval$: Observable<number>;
}) =>
  combineLatest([pause$, interval$]).pipe(
    switchMap(([isPause, intervalVal]) => {
      return isPause ? NEVER : interval(intervalVal);
    })
  );

export const randomizedInterval = (
  period: number,
  deviation = 1
): Observable<void> => {
  return new Observable(subscriber => {
    let timeout: any;

    (function next() {
      timeout = setTimeout(() => {
        next();
        subscriber.next();
      }, period + (Math.random() - 0.5) * period * deviation);
    })();

    return () => {
      clearTimeout(timeout);
    };
  });
};
