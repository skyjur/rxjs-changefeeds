// tslint:disable: no-shadowed-variable
import {directive, html, render} from "lit-html";
import {repeat} from "lit-html/directives/repeat";
import { rxReplace } from "rx-lit-html/src/rxReplace";
import { interval } from "rxjs";
import { map, throttleTime } from "rxjs/operators";
import { feedToMap } from "../src/operators/feedToMap";
import { ChangeFeed$ } from "../src/types";
import { SampleUserFeedGenerator } from "./sample-data/SampleUserFeedGenerator";
import {IUser, IUser$} from "./sample-data/SampleUserFeedGenerator";
import { blink } from "./ui/utils";

const usersGenerator = new SampleUserFeedGenerator();
const users$ = interval(50).pipe(
    map(() => usersGenerator.next()),
);

const userRow = (user: IUser) =>
    blink(html`${user.name} (${user.id.slice(5)})
            <br />
            ${user.company}

            ${user.jobTitle}`);

const userRow$ = (user$: IUser$) =>
    rxReplace(user$, userRow);

const usersList = (users$: ChangeFeed$<IUser>) =>
    html`
        <div>
            ${rxReplace<Map<any, any>>(
                users$.pipe(
                    feedToMap(),
                    throttleTime(500),
                ),
                (users: Map<any, any>) =>
                    html`
                        Users: ${users.size}
                        <ul>
                        ${repeat(
                            Array.from(users.keys()),
                            (key) => key,
                            (key) =>
                                html`<li id=${key}>
                                    ${key}
                                    ${userRow$(users.get(key)!)}
                                </li>`,
                        )}
                    </ul>`,
            )}
        </div>
    `;

render(
    usersList(users$),
    document.getElementById("root")!,
);
