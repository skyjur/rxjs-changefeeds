import { rxReplace } from "../../directives/rxReplace";
import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { styleMap } from "lit-html/directives/style-map";

export class Context {
  html = html;
  rxReplace = rxReplace;
  repeat = repeat;
  styleMap = styleMap;

  get document(): Document {
    return window.document;
  }

  get ctx(): Context {
    return this;
  }
}

export const context = new Context();
