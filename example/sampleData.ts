import { Observable, Subject, generate, combineLatest, concat, of, interval, NEVER } from "rxjs";
import { switchMap } from "rxjs/operators";
import { ChangeFeed, ChangeFeed$ } from "../src/types";
import * as faker from "faker"
import { timingSafeEqual } from "crypto";

const statusCodes = ["planning", "todo", "assigned", "testing", "done"];

export type User = ReturnType<typeof createUser>
export type User$ = Observable<User>

interface Options<T extends HasId> {
    generator: 
    pause$: Observable<boolean>,
    restart$: Observable<void>,
    n$: Observable<number>,
    interval$: Observable<number>
}

interface HasId {
    id: string
}

abstract class SampleFeedGenerator<T extends HasId> {
    private data: T[] = [] 
    initializing = false
    ready = false

    abstract protected create(): T
    abstract protected update(obj: T): T

    next(targetSize: number): ChangeFeed<T> {
        const {data} = this

        if(!this.initializing && !this.ready) {
            this.initializing = true
            return ['initializing']
        }

        if(data.length >= targetSize && !this.ready) {
            this.ready = true
            this.initializing = false
            return ['ready']
        }

        const i = Math.floor(Math.random() * data.length)

        const r = Math.random() * (data.length / targetSize)

        if(!this.ready || r > 0.9) {
            // add additional object
            const obj = this.create()
            data.push(obj)
            return ["set", obj.id, obj]
        } else if(r < 0.1) {
            // remove existing object
            const i = Math.floor(Math.random() * data.length)
            const obj = data[i]
            data.splice(i, 1)
            return ["del", obj.id]
        } else {
            const i = Math.floor(Math.random() * data.length)
            const obj = data[i] = this.update(data[i]);
            return ["set", obj.id, obj]
        }
    }
}

class UserSampleFeed extends SampleFeedGenerator<User> {
    create() {
        return {
            id: faker.random.uuid(),
            name:  faker.fake('{{name.lastName}}, {{name.firstName}} {{name.suffix}}'),
            city: faker.address.city(),
            lastLogin: faker.date.past(1),
            company: faker.company.companyName(),
            jobTitle: faker.name.jobTitle()
        }
    }

    update(user: User) {
        user = {... user}
    
        if(Math.random() > 0.7) {
            user.company = faker.company.companyName()
        }
        if(Math.random() > 0.7) {
            user.jobTitle = faker.name.jobTitle()
        }
        if(Math.random() > 0.7) {
            user.lastLogin = faker.date.past(1)
        }
    
        return user
    }
}

export function controlledInterval<T extends HasId>(inputs: { 
    pause$: Observable<boolean>
    interval$: Observable<number>
}) {
    return combineLatest(inputs.pause$, inputs.interval$).pipe(
        switchMap(([pauseValue, intervalValue]) => {
            return pauseValue
                ? NEVER
                : interval(intervalValue)
        })
    )
}
