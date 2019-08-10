import { ChangeFeed } from "../../src/types";

export interface IHasId {
  id: string;
}

export abstract class FeedGenerator<T extends IHasId> {
  public initializing = false;
  public ready = false;
  public targetSize = 100;
  public data: T[] = [];
  public next(): ChangeFeed<T> {
    const { targetSize } = this;
    const { data } = this;
    if (!this.initializing && !this.ready) {
      this.initializing = true;
      return ["initializing"];
    }
    if (data.length >= targetSize && !this.ready) {
      this.ready = true;
      this.initializing = false;
      return ["ready"];
    }
    const i = Math.floor(Math.random() * data.length);
    const r = Math.random() * (targetSize / data.length);
    if (!this.ready || r > 0.9) {
      // add additional object
      const obj = this.create();
      data.push(obj);
      return ["set", obj.id, obj];
    } else if (r < 0.1) {
      // remove existing object
      const obj = data[i];
      data.splice(i, 1);
      return ["del", obj.id];
    } else {
      const obj = (data[i] = this.update(data[i]));
      return ["set", obj.id, obj];
    }
  }
  protected abstract create(): T;
  protected abstract update(obj: T): T;
}
