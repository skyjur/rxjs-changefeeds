import { Observable, Subject } from "rxjs";
import { ChangeFeed } from "../src/types";
import * as faker from "faker"

const statusCodes = ["planning", "todo", "assigned", "testing", "done"];

type User = ReturnType<typeof createUser>

function createUser() {
    return {
        id: faker.random.uuid(),
        name:  faker.fake('{{name.lastName}}, {{name.firstName}} {{name.suffix}}'),
        city: faker.address.city(),
        lastLogin: faker.date.past(1),
        company: faker.company.companyName(),
        jobTitle: faker.name.jobTitle()
    }
}

function updateUser(user: User) {
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

interface Options<T> {
    n?: number,
    initializationTime?: number,
    updatesPerSecond?: number,
    create?: () => T
    update?: (obj: T) => T
}

export function generateSampleFeed<T>({ 
    n = 100,
    initializationTime = 1000,
    updatesPerSecond = 5,
    create = createUser,
    update = updateUser
}: Options<T> = {}) {
    return new Observable<ChangeFeed<T>>((subscriber) => {
        subscriber.next(["initializing", undefined]);
        const data: T[] = [];
        var closed = false

        for (let i = 0; i < n; i++) {
            setTimeout(() => {
                if(!closed) {
                    const obj = create()
                    data.push(obj)
                    subscriber.next(["set", obj])
                }
            }, Math.random() * initializationTime);
        }

        const interval = setInterval(() => {
            if(Math.random() < 0.05) {
                data.push(create())
                subscriber.next(["set", data[data.length-1]])
            } else if(Math.random() < 0.05) {
                const i = Math.floor(Math.random() * data.length)
                subscriber.next(["del", data[i]])
                data.splice(i, 1)
            } else {
                const i = Math.floor(Math.random() * data.length)
                data[i] = update(data[i]);
                subscriber.next(["set", data[i]])
            }
        }, 1000 / updatesPerSecond);

        return () => {
            closed = true
            clearInterval(interval);
        };
    });
}
