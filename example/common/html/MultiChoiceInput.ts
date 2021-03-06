import { Subject, BehaviorSubject } from "rxjs";
import { Context } from "../../moving-dots/html/Context";
import { map, tap, distinct, distinctUntilChanged } from "rxjs/operators";
import { CheckboxInput } from "./CheckboxInput";

export interface Choice<T> {
  label: string;
  value: T;
}

let inputId = 1;

export const MultiChoiceInput = <T>(
  { html, rxReplace, ctx }: Context,
  allChoices: Array<T>,
  selectedChoices$: BehaviorSubject<T[]>,
  Label: (ctx: Context, value: T) => any
) =>
  allChoices.map(choice => {
    const inputName = `checkbox-${inputId++}`;
    return html`
      <div class="field">
        ${CheckboxInput(
          ctx,
          inputName,
          isSelected(selectedChoices$, choice),
          changeHandler(selectedChoices$, choice)
        )}
        <label for=${inputName}>
          ${Label(ctx, choice)}
        </label>
      </div>
    `;
  });

const isSelected = (selectedChoices$: BehaviorSubject<any[]>, choice: any) =>
  selectedChoices$.pipe(
    map(choices => choices.indexOf(choice) !== -1),
    distinctUntilChanged()
  );

const changeHandler = (choices$: BehaviorSubject<any[]>, choice: any) => (
  checked: boolean
) => {
  const otherChoices = choices$.value.filter(
    selectedChoice => selectedChoice !== choice
  );
  choices$.next(checked ? [...otherChoices, choice] : otherChoices);
};
