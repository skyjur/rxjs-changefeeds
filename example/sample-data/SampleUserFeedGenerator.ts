import * as faker from "faker";
import { Observable } from "rxjs";
import { SampleFeedGenerator } from "./SampleFeedGenerator";

export interface User {
    id: string;
    name: string;
    city: string;
    lastLogin: Date;
    company: string;
    jobTitle: string;
}
export type User$ = Observable<User>;

export class SampleUserFeedGenerator extends SampleFeedGenerator<User> {
    public create(): User {
        return {
            city: faker.address.city(),
            company: faker.company.companyName(),
            id: faker.random.uuid(),
            jobTitle: faker.name.jobTitle(),
            lastLogin: faker.date.past(1),
            name:  faker.fake("{{name.lastName}}, {{name.firstName}} {{name.suffix}}"),
        };
    }

    public update(user: User) {
        user = {... user};

        if (Math.random() > 0.7) {
            user.company = faker.company.companyName();
        }
        if (Math.random() > 0.7) {
            user.jobTitle = faker.name.jobTitle();
        }
        if (Math.random() > 0.7) {
            user.lastLogin = faker.date.past(1);
        }

        return user;
    }
}
