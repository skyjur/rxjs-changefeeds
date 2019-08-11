import faker from "faker";
import randomColor from "randomcolor";
import { Observable, of, concat, merge } from "rxjs";
import { map, switchMap, first, takeUntil, skip, share } from "rxjs/operators";
import { ChangeFeed } from "../../src/types";
import { randomizedInterval } from "./utils";
import { number$, void$ } from "../../src/_internal/types";

export interface Point {
  id: string;
  color: string;
  x: number;
  y: number;
}

export type PointCf = ChangeFeed<Point>;
export type PointCf$ = Observable<PointCf>;

export const MultiPointsCf = (
  numOfPoints$: number$,
  createPointCf: () => PointCf$
): PointCf$ =>
  numOfPoints$.pipe(
    switchMap(numOfPoints => {
      const points: PointCf$[] = new Array(numOfPoints).map(() =>
        createPointCf().pipe(
          share(),
          takeUntil(numOfPoints$)
        )
      );

      const firsts: PointCf$[] = points.map(point => point.pipe(first()));
      const others: PointCf$[] = points.map(point => point.pipe(skip(1)));

      return concat<PointCf>(
        of<PointCf>(["initializing"]),
        merge(...firsts),
        of<PointCf>(["ready"]),
        merge(...others)
      );
    })
  );

export const VariableIntervalPointCf = (updateIntervalValue: number$) =>
  SinglePointFeed(
    updateIntervalValue.pipe(
      switchMap(intervalValue => randomizedInterval(intervalValue))
    )
  );

export const SinglePointFeed = (
  interval$: void$,
  { random = Math.random } = {}
): PointCf$ => {
  let point: RandomPointGenerator | null = null;

  return interval$.pipe(
    map(() => {
      if (point && random() < 1 / 100) {
        // randomly delete & recreate a new point
        const { id } = point;
        point = null;
        return ["del", id];
      } else {
        if (!point) {
          point = new RandomPointGenerator();
        }
        return ["set", point.id, point.next()];
      }
    })
  );
};

class RandomPointGenerator {
  id = faker.random.uuid();
  color = randomColor();
  pathGenerator = circularMotionGenerator();

  next(): Point {
    return {
      id: this.id,
      color: this.color,
      ...this.pathGenerator()
    };
  }
}

const circularMotionGenerator = (
  radius = Math.random(),
  speed = (Math.random() * Math.PI) / 360 / 5,
  startingAngle = Math.random() * Math.PI
) => {
  return () => {
    const point = {
      x: radius * Math.cos(startingAngle),
      y: radius * Math.sin(startingAngle)
    };
    startingAngle += speed;
    return point;
  };
};
