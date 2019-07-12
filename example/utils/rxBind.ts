import { directive } from "lit-html";
import { Observable } from "rxjs";

const rxHtmlState = new WeakMap();

export const rxBind: <T>(observable: Observable<T>, template: (value: T) => any) => any
    = directive((observable, template) => (part: any) => {
    const state = rxHtmlState.get(part) || {};
    if (state.observable !== observable || state.template !== template) {
        if (state.subscription) {
            state.subscription.unsubscribe();
        }
        state.template = template;
        state.observable = observable;
        state.subscription = observable.subscribe({
            next(value) {
                part.setValue(template(value));
                part.commit();
            },
            error(e) {
                // tslint:disable-next-line:no-console
                console.error(e);
            },
        });
        rxHtmlState.set(part, state);
    }
});
