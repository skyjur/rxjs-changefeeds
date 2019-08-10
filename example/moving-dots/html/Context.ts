import { rxReplace } from "../../utils/rxReplace";
import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat";

export class Context {
    html = html
    rxReplace = rxReplace
    repeat = repeat

    get document(): Document {
        return window.document
    }

    get ctx(): Context {
        return this;
    }
}


export const context = new Context();
