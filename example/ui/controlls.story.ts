import { html } from "lit-html";
import { BehaviorSubject } from "rxjs";
import { rxBind } from "../utils/rxBind";
import { intervalInput } from "./controlls";

export const controllsStory = () => {
    const $val = new BehaviorSubject<number>(0);

    return html`
    <h2>intervalInput</h2>
    <div>
        ${intervalInput(10, (val) => $val.next(val))}
        ${rxBind($val, (val) => `${val}`)}
    </div>
    `;
};
