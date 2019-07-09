import { Subject, Subscriber, ReplaySubject } from "rxjs";
import { ChangeFeed } from "./types";
import { ChangeFeedHandler, changeFeedHandler } from "./utils";

/**
 * Buffer feed and reply all objects to newly connected subscriber
 *
 * Following ReplySubject paradigm of rxjs
 *
 */
export class ChangeFeedReplaySubject<T> extends Subject<ChangeFeed<T>> {
  private state = new ChangeFeedRecorder<T>();

  public next(record: ChangeFeed<T>) {
    this.state.next(record);
    super.next(record);
  }

  public _subscribe(subscriber: Subscriber<ChangeFeed<T>>) {
    const subscription = super._subscribe(subscriber);
    this.state.replay(subscriber)
    return subscription;
  }
}

class ChangeFeedRecorder<T> implements ChangeFeedHandler<T> {
  private data = new Map<string, T>()
  private isReady = false

  next = changeFeedHandler(this)

  replay(subscriber: Subscriber<ChangeFeed<T>>) {
    subscriber.next(["initializing"]);
    for (const key of this.data.keys()) {
      subscriber.next(["set", key, this.data.get(key)!]);
    }
    if (this.isReady === true) {
      subscriber.next(["ready"]);
    }
  }

  initializing() {
    this.data.clear()
    this.isReady = false
  }

  ready() {
    this.isReady = true
  }

  set(key: string, value: T) {
    this.data.set(key, value)
  }

  del(key: string) {
    this.data.delete(key)
  }
}
