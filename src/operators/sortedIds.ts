import { Observable, OperatorFunction } from "rxjs";
import { debounceTime, filter, map } from "rxjs/operators";
import { ChangeFeed, ChangeFeed$, HasId } from "../types";

interface Options {
  rate?: number;
}

export function sortedChangeFeedIds<T extends HasId = HasId>(
  cmp: (a: T, b: T) => number,
  { rate = 500 }: Options = {},
): OperatorFunction<ChangeFeed<T>, string[]> {
  return (input: ChangeFeed$<T>) => {
    return new Observable<string[]>((subscriber) => {

      const accumulator = new Accumulator<T>(cmp);

      const sub = input
        .pipe(
          map((val) => accumulator.next(val)),
          debounceTime(rate),
          filter((acc) => acc.hasUpdates),
          map((acc) => acc.getSortedList()),
        )
        .subscribe(subscriber);

      return () => {
        sub.unsubscribe();
      };
    });
  };
}

class Accumulator<T extends HasId> {
  public hasUpdates: boolean = false;
  private data: Map<string, any> = new Map();
  private sortedList: string[] = [];

  constructor(private cmp: (a: any, b: any) => number) { }

  public next(val: ChangeFeed<T>): Accumulator<T> {
    switch (val[0]) {
      case "initializing":
        this.data.clear();
        this.hasUpdates = true;
        break;
      case "ready":
        break;
      case "set":
        this.set(val[1]);
        break;
      case "del":
        this.del(val[1]);
        break;
    }
    return this;
  }

  public getSortedList(): string[] {
    if (!this.hasUpdates) {
      return this.sortedList;
    }
    const { data, cmp } = this;
    const newList = Array.from(data.keys());
    newList.sort((key1, key2) => {
      return cmp(data.get(key1), data.get(key2));
    });
    this.sortedList = newList;
    this.hasUpdates = false;
    return newList;
  }

  private set(obj: T) {
    const { data } = this;
    const { id } = obj;
    const isNew = !data.has(id);
    data.set(id, obj);

    if (!this.hasUpdates) {
      if (isNew) {
        this.hasUpdates = true;
      } else {
        const i = this.sortedList.indexOf(id);
        const left = data.get(this.sortedList[i - 1]);
        const right = data.get(this.sortedList[i + 1]);

        const leftIsSmaller = !left || this.cmp(left, obj) > 0;
        const rightIsGreater = !right || this.cmp(right, obj) < 0;

        if (leftIsSmaller || rightIsGreater) {
          this.hasUpdates = true;
        }
      }
    }
  }

  private del(obj: HasId) {
    this.data.delete(obj.id);
    this.hasUpdates = true;
  }
}
