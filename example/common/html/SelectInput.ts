import { Context } from "../../moving-dots/html/Context";
import { rxReplace } from "../../directives/rxReplace";
import { Subject } from "rxjs";

export interface SelectInputProps<T> {
  subject$: Subject<T>;
  options: T[];
  getLabel(value: T): string;
}

export const SelectInput = <T>(
  { html }: Context,
  { subject$, options, getLabel }: SelectInputProps<T>
) => {
  const onInput = (e: HTMLSelectElementEvent) => {
    const index = parseInt(e.target.value, 10);
    const value = options[index];
    subject$.next(value);
  };

  return rxReplace(
    subject$,
    currentValue =>
      html`
        <div class="select">
          <select @input=${onInput}>
            ${options.map(
              (value, index) =>
                html`
                  <option value=${index} .selected=${currentValue === value}>
                    ${getLabel(value)}
                  </option>
                `
            )}
          </select>
        </div>
      `
  );
};
