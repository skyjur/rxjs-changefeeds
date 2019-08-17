import { directive, NodePart } from "lit-html";
import { Observable } from "rxjs";

const rxReplaceState = new WeakMap();

/**
 * Similar to lit-html's asyncReplace, but for rxjs observables.
 *
 * Note that, there subscription will continue if element is removed from tree.
 * This is because lit-html does not provide forward way to hook up to deatchment event.
 *
 * So it's important to architect rxjs observables in a way, that observables are
 * completed from otuside if they are to be removed from dom bindings.
 */
export const rxReplace: <T>(
  observable: Observable<T>,
  template?: (val: T) => any
) => any = directive(
  (observable, template = val => val) => (part: NodePart) => {
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
        }
      });
      rxReplaceState.set(part, state);
    }
  }
);
