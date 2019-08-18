import randomColor from "randomcolor";
import { Observable, Unsubscribable, interval } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { ChangeFeed } from "../../../src/types";
import { number$ } from "../../../src/_internal/types";
import { AZSequenceGenerator } from "../../sample-data/SequenceGenerator";

export interface Point {
  color: string;
  x: number;
  y: number;
}

export type Point$ = Observable<Point>;
export type PointCf = ChangeFeed<Point, string>;
export type PointCf$ = Observable<PointCf>;

export const PointsChangeFeed = (
  numOfPoints$: number$,
  updateInterval$: number$
): PointCf$ =>
  new Observable(subscriber => {
    const idGenerator = new AZSequenceGenerator();
    const points = new Map<string, Unsubscribable>();

    const numOfPointsSub = numOfPoints$.subscribe({
      next(numOfPoints) {
        while (numOfPoints > points.size) {
          const id = idGenerator.next();
          const point = VariableIntervalPoint(updateInterval$);
          const pointSub = point.subscribe({
            next(value) {
              subscriber.next(["set", id, value]);
            }
          });
          points.set(id, pointSub);
        }

        while (numOfPoints < points.size) {
          const keys = Array.from(points.keys());
          const indexToRemove = Math.floor(Math.random() * points.size);
          const idToRemove = keys[indexToRemove];
          points.get(idToRemove)!.unsubscribe();
          points.delete(idToRemove);
          subscriber.next(["del", idToRemove]);
        }
      }
    });

    return () => {
      numOfPointsSub.unsubscribe();
      for (const key of points.keys()) {
        points.get(key)!.unsubscribe();
      }
    };
  });

export const VariableIntervalPoint = (updateIntervalValue: number$) => {
  let point = new RandomPointGenerator();
  return updateIntervalValue.pipe(
    switchMap(intervalValue => interval(intervalValue)),
    map(() => point.next())
  );
};

class RandomPointGenerator {
  color = randomColor();
  pathGenerator = circularMotionGenerator();

  next(): Point {
    return {
      color: this.color,
      ...this.pathGenerator()
    };
  }
}

const circularMotionGenerator = (
  radius = 0.5 + Math.random() / 2,
  speed = ((0.25 + Math.random() * 0.75) * Math.PI * 2) / 360 / 40,
  startingAngle = Math.random() * Math.PI * 2
) => {
  const t = Date.now();
  return () => {
    const angle = startingAngle + speed * (Date.now() - t);
    const point = {
      x: radius * Math.sin(angle),
      y: radius * Math.cos(angle)
    };
    return point;
  };
};
