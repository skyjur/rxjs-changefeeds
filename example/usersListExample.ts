// tslint:disable: no-shadowed-variable
import { html, render } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { interval, concat } from "rxjs";
import { map, take, throttle, scan } from "rxjs/operators";
import { ChangeFeed$ } from "../src/types";
import {
  UserFeedGenerator,
  User,
  User$,
  ΔUser$
} from "./sample-data/UserFeedGenerator";
import { blinkOnChange } from "./ui/utils";
import { feedSortedList } from "../src/operators/feedSortedList";
import { feedGroupBy } from "../src/operators/feedGroupBy";
import { rxReplace } from "./directives/rxReplace";
import { cmpBy } from "./utils/common";
import { feedToKeyValueMap } from "../src";

const usersGenerator = new UserFeedGenerator();
usersGenerator.targetSize = 100;

// Creates dummy changefeed of user updates:
const users$: ΔUser$ = concat(interval(1).pipe(take(100)), interval(50)).pipe(
  map(() => usersGenerator.next())
);

const userRow = (user: User) =>
  html`
    <tr id=${user.id}>
      <td class=${blinkOnChange(user.name)}>${user.name}</td>
      <td class=${blinkOnChange(user.company)}>${user.company}</td>
      <td class=${blinkOnChange(user.city)}>${user.city}</td>
      <td class=${blinkOnChange(user.jobTitle)}>${user.jobTitle}</td>
    </tr>
  `;

const userRow$ = (user$: User$) => rxReplace(user$, userRow);

const usersGroupedByCity = (Δuser$: ΔUser$) =>
  html`
    <div class="section">
      <h1 class="title">Change feed content:</h1>
      <pre>
${rxReplace(
          Δuser$.pipe(
            scan(
              (agg, record) => {
                agg = agg.length === 0 ? [] : agg;
                agg.push(record);
                if (agg.length > 10) {
                  agg.shift();
                }
                return agg;
              },
              [] as any[]
            )
          ),
          lastRecords =>
            lastRecords.map(record => JSON.stringify(record)).join("\n")
        )}
        </pre
      >
    </div>
    <div>
      ${rxReplace(
        Δuser$.pipe(
          feedGroupBy(user => user.city),
          feedToKeyValueMap(),
          throttle(() => interval(200))
        ),
        (groups: Map<string, ΔUser$>) => html`
          ${repeat(
            groups.entries(),
            ([city]) => city,
            ([city, users]) => html`
              <div class="section">
                <h2 class="subtitle">
                  City: ${city}
                </h2>

                ${sortedUsersList(users)}
              </div>
            `
          )}
        `
      )}
    </div>
  `;

const sortedUsersList = (users$: ΔUser$) =>
  html`
    <div>
      ${rxReplace<User$[]>(
        users$.pipe(feedSortedList(userCmp, { throttleTime: 50 })),
        users =>
          html`
            <table class="table">
              <thead></thead>
              <tbody>
                ${repeat(users, user$ => user$, user$ => userRow$(user$))}
              </tbody>
            </table>
          `
      )}
    </div>
  `;

const userCmp = cmpBy<User>(row => row.name);

render(usersGroupedByCity(users$), document.getElementById("root")!);
