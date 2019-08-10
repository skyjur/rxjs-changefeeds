import faker from "faker";
import { FeedGenerator } from "./FeedGenerator";
import { AZSequenceGenerator } from "./SequenceGenerator";
import randomColor from "randomcolor";
import { Observable, interval, combineLatest, of, concat } from "rxjs";
import { throttle, map, switchMap, onErrorResumeNext } from "rxjs/operators";
import { ChangeFeed, ChangeFeed$ } from "../../src/types";
import { randomizedInterval } from "./utils";

export interface Point {
  id: string;
  color: string;
  x: number;
  y: number;
}

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
  radius: number = Math.random(),
  speed: number = (Math.random() * Math.PI) / 360 / 5,
  startingAngle: number = Math.random() * Math.PI
) => {
  return () => {
    let point = {
      x: radius * Math.cos(startingAngle),
      y: radius * Math.sin(startingAngle)
    };
    startingAngle += speed;
    return point;
  };
};

export class PointFeedGenerator extends FeedGenerator<Point> {
  private seq = new AZSequenceGenerator();
  private timeStarted = Date.now();

  protected create(): Point {
    return new CircleMotionPoint();
  }

  protected update(obj: Point): Point {
    if (obj instanceof CircleMotionPoint) {
      return obj.updateTime(Date.now() - this.timeStarted);
    }
    return obj;
  }
}

export const pointsFeed = (
  updateInterval$: Observable<number>,
  numberOfPoints$: Observable<number>
) =>
  numberOfPoints$.pipe(
    throttle(() => interval(1000)),
    switchMap(numOfPoints => {
      const points = new Array(numOfPoints).map(i =>
        pointFeed(updateInterval$)
      );

      return concat<ChangeFeed<Point>>(
        of<ChangeFeed<Point>>(["initializing"]),
        ...of<ChangeFeed<Point>>(["ready"])
      );
    })
  );

export const singlePointFeed = (updateInterval$: Observable<number>) => {
  let point: CircleMotionPoint | null = null;

  return updateInterval$.pipe(
    switchMap(intervalValue =>
      randomizedInterval(intervalValue).pipe(
        map(() => {
          if (point && Math.random() < 1 / 100) {
            // randomly delete & recreate a new point
            const { id } = point;
            point = null;
            return ["del", id];
          } else {
            if (!point) {
              point = new CircleMotionPoint();
            }
            return ["set", point.id, point.next()];
          }
        })
      )
    )
  );
};
//         next(value) {

//           while (points.length > value) {
//             const removedPoint = points.splice(Math.random() * points.length, 1)

//           }

//           while (points.length < value) {

//           }

//         }
//       });

//     return () => {};
//   });
// }

// interface CircularMotionProps {
//   radius: number
//   startAngle: number
//   speed: number
// }

// const circularMotionPosition = ({
//   radius,
//   startAngle,
//   speed
// }: CircularMotionProps) => (time: number) => ({
//     x: radius * Math.cos(startAngle + speed * time),
//     y: radius * Math.sin(startAngle + speed * time)
//   })
