import { Subject, Subscriber } from "rxjs";
import { ChangeFeed } from "./types";
import { ChangeFeedHandler, changeFeedHandler } from "./utils";

/**
 * Buffer feed and reply all objects to newly connected subscriber
 *
 * Following ReplySubject paradigm of rxjs
 *
 */
export class ChangeFeedReplaySubject<Key, Value> extends Subject<
  ChangeFeed<Key, Value>
> {
  private state = new ChangeFeedRecorder<Key, Value>();

  public next(record: ChangeFeed<Key, Value>) {
    this.state.next(record);
    super.next(record);
  }

  public _subscribe(subscriber: Subscriber<ChangeFeed<Key, Value>>) {
    // tslint:disable-next-line:deprecation
    const subscription = super._subscribe(subscriber);
    this.state.replay(subscriber);
    return subscription;
  }
}

class ChangeFeedRecorder<Key, Value> implements ChangeFeedHandler<Key, Value> {
  private initializingStarted = false;
  private data = new Map<Key, Value>();
  private isReady = false;

  next = changeFeedHandler(this);

  replay(subscriber: Subscriber<ChangeFeed<Key, Value>>) {
    if (this.initializingStarted) {
      subscriber.next(["initializing"]);
    }
    for (const key of this.data.keys()) {
      subscriber.next(["set", key, this.data.get(key)!]);
    }
    if (this.isReady === true) {
      subscriber.next(["ready"]);
    }
  }

  initializing() {
    this.data.clear();
    this.isReady = false;
    this.initializingStarted = true;
  }

  ready() {
    this.isReady = true;
  }

  set(key: Key, value: Value) {
    this.data.set(key, value);
  }

  del(key: Key) {
    this.data.delete(key);
  }
}
