import { Observable, Subject, generate } from "rxjs";
import { ChangeFeed, ChangeFeed$ } from "../src/types";
import * as faker from "faker"

const statusCodes = ["planning", "todo", "assigned", "testing", "done"];

export type User = ReturnType<typeof createUser>
export type User$ = Observable<User>

export function createUser() {
    return {
        id: faker.random.uuid(),
        name:  faker.fake('{{name.lastName}}, {{name.firstName}} {{name.suffix}}'),
        city: faker.address.city(),
        lastLogin: faker.date.past(1),
        company: faker.company.companyName(),
        jobTitle: faker.name.jobTitle()
    }
}

export function updateUser(user: User) {
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

interface Options<T extends HasId> {
    create(): T
    update(obj: T): T
    n?: number,
    initializationTime?: number,
    updatesPerSecond?: number,
}

interface HasId {
    id: string
}

export function generateSampleFeed<T extends HasId>({ 
    create,
    update,
    n = 100,
    initializationTime = 1000,
    updatesPerSecond = 5,
}: Options<T>) {
    return new Observable<ChangeFeed<T>>((subscriber) => {
        subscriber.next(["initializing"]);
        const data: T[] = [];
        var closed = false

        for (let i = 0; i < n; i++) {
            setTimeout(() => {
                if(!closed) {
                    const obj = create()
                    data.push(obj)
                    subscriber.next(["set", obj.id, obj])
                }
            }, Math.random() * initializationTime);
        }

        const interval = setInterval(() => {
            if(Math.random() < 0.3 && data.length < n * 2) {
                // add additional object
                data.push(create())
                const i = data.length - 1
                const obj = data[data.length-1]
                subscriber.next(["set", obj.id, obj])
            } else if(Math.random() < 0.3 && data.length > 0) {
                // remove existing object
                const i = Math.floor(Math.random() * data.length)
                const obj = data[i]
                data.splice(i, 1)
                subscriber.next(["del", obj.id])
            } else {
                const i = Math.floor(Math.random() * data.length)
                const obj = data[i] = update(data[i]);
                subscriber.next(["set", obj.id, obj])
            }
        }, 1000 / updatesPerSecond);

        return () => {
            closed = true
            clearInterval(interval);
        };
    });
}

export const users$ = generateSampleFeed({
    n: 400,
    updatesPerSecond: 50,
    create: createUser,
    update: updateUser
})