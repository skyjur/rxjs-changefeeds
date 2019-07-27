import { directive, NodePart } from "lit-html";
import { Observable } from "rxjs";

const rxReplaceState = new WeakMap();

export const rxReplace: <T>(observable: Observable<T>, template: (value: T) => any) => any
    = directive((observable, template) => (part: NodePart) => {
        const state = rxReplaceState.get(part) || {};
        if (state.observable !== observable) {
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
            rxReplaceState.set(part, state);
        }
    });
