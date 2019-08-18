import { boolean$ } from "../../../../src/_internal/types";
import { Context } from "../Context";
import { distinct, tap } from "rxjs/operators";

export const CheckboxInput = (
  { rxReplace, html }: Context,
  checked$: boolean$,
  onChange: (checked: boolean) => void
) =>
  rxReplace(checked$, checked => {
    const changeHandler = (e: HTMLInputElementEvent) => {
      e.target.checked = checked;
      onChange(!checked);
    };

    return html`
      <input
        type="checkbox"
        @input=${changeHandler}
        .checked=${checked ? true : false}
      />
    `;
  });
