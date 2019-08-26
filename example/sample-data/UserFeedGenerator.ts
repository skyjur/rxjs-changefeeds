import * as faker from "faker";
import { Observable } from "rxjs";
import { FeedGenerator } from "./FeedGenerator";
import { ChangeFeed } from "../../src/types";

export interface User {
  id: string;
  name: string;
  country: string;
  city: string;
  lastLogin: Date;
  company: string;
  jobTitle: string;
}
export type User$ = Observable<User>;
export type ΔUser = ChangeFeed<string, User>;
export type ΔUser$ = Observable<ΔUser>;

const citySample = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
  "Austin",
  "Jacksonville",
  "Fort Worth",
  "Columbus",
  "San Francisco"
];

export class UserFeedGenerator extends FeedGenerator<User> {
  public citiesRatio = 0.1;

  public create(): User {
    return {
      country: faker.address.country(),
      city: this.randomCity(),
      company: faker.company.companyName(),
      id: faker.random.uuid(),
      jobTitle: faker.name.jobTitle(),
      lastLogin: faker.date.past(1),
      name: faker.fake("{{name.lastName}}, {{name.firstName}} {{name.suffix}}")
    };
  }

  public update(user: User) {
    user = { ...user };

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

  private randomCity() {
    const numOfCities = Math.min(
      Math.ceil(this.targetSize * this.citiesRatio),
      citySample.length
    );
    return citySample[Math.floor(Math.random() * numOfCities)];
  }
}
