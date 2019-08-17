import { Subject, BehaviorSubject } from "rxjs";
import { Context } from "../Context";

export interface Choice<T> {
  label: string
  value: T
}

export const MultiChoiceInput = <T>(
  { html, rxReplace, ctx }: Context,
  choices: Array<T>,
  selectedChoices$: BehaviorSubject<T[]>,
  Label: (ctx: Context, value: T) => any
) =>
  rxReplace(
    selectedChoices$,
    selectedChoices =>
      choices.map(
        choice => html`
          <div class="field">
            <label class="checkbox">
              <input
                type="checkbox"
                @change=${changeHandler(selectedChoices$, choice)}
                ?checked=${selectedChoices.indexOf(choice) !== -1}
                />
                ${Label(ctx, choice)}
            </label>
          </div>
        `
      )
  );

const changeHandler = (
  choices$: BehaviorSubject<any[]>,
  choice: any
) => (e: HTMLInputElementEvent) => {
  choices$.next(choices$.value.filter((selectedValue) => {
    if (selectedValue === choice) {
      return e.target.checked
    } else {
      return true
    }
  });
};
