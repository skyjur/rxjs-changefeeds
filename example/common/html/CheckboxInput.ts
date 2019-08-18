import { boolean$ } from "../../../src/_internal/types";
import { Context } from "../../moving-dots/html/Context";
import { distinct, tap } from "rxjs/operators";

export const CheckboxInput = (
  { rxReplace, html }: Context,
  id: string,
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
        id=${id}
        type="checkbox"
        class="is-checkradio"
        @input=${changeHandler}
        .checked=${checked ? true : false}
      />
    `;
  });
