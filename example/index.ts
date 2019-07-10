import {User, users$, User$} from './sampleData'
import {html, render, directive} from 'lit-html'
import {repeat} from 'lit-html/directives/repeat'
import { Observable } from 'rxjs';
import { ChangeFeed, ChangeFeed$ } from '../src/types';
import { map, tap, debounce, debounceTime, throttleTime } from 'rxjs/operators';
import { feedToMap } from '../src/operators/feedToMap';

const userRow = (user: User) =>
    blink(html`${user.name} (${user.id.slice(5)})
            <br />
            ${user.company}

            ${user.jobTitle}`)

const userRow$ = (user$: User$) =>
    rxBind(user$, userRow)

const usersList = (users$: ChangeFeed$<User>) =>
    html`
        <div>
            ${rxBind(
                users$.pipe(
                    feedToMap(),
                    throttleTime(500)
                ),
                (users) => 
                    html`
                        Users: ${users.size}
                        <ul>
                        ${repeat(
                            Array.from(users.keys()),
                            key => key,
                            key =>
                                html`<li id=${key}>
                                    ${key}
                                    ${userRow$(users.get(key)!)}
                                </li>`
                        )}
                    </ul>`
            )}
        </div>
    `

const rxHtmlState = new WeakMap();

const rxBind: <T>(observable: Observable<T>, template: (value: T) => any) => any
    = directive((observable, template) => (part: any) => {
    const state = rxHtmlState.get(part) || {}
    if(state.observable !== observable || state.template !== template) {
        if(state.subscription) {
            console.log('replacing subscription')
            state.subscription.unsubscribe()
        }
        state.template = template
        state.observable = observable
        state.subscription = observable.subscribe({
            next(value) {
                part.setValue(template(value))
                part.commit();
            },
            error(e) {
                console.error(e)
            }
        })
        rxHtmlState.set(part, state)
    }
})

render(
    usersList(users$.pipe(
        // tap(console.log)
    )),
    document.getElementById('root')!    
)

const blink = directive((value) => (part: any) => {
    const t = (on: any) =>
        html`<style>
        .blink {
            background-color: green;
            transition: background-color 0.5s;
        }
        </style>
        <span class=${on ? 'blink' : ''}>${value}</span>`
    part.setValue(t(true))
    setTimeout(() => {
        part.setValue(t(false))
        part.commit()
    }, 500)
})
