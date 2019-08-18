import { rxReplace } from "../../../directives/rxReplace";
import { cacheResult } from "../../../directives/cacheResult";
import { ChangeFeed$ } from "../../../../src/types";
import { Context } from "../Context";

export const RawChangeFeed = (
  context: Context,
  changeFeed$: ChangeFeed$<any>
) => cacheResult(changeFeed$, () => _RawChangeFeed(context, changeFeed$));

export const _RawChangeFeed = (
  context: Context,
  changeFeed$: ChangeFeed$<any>
) => {
  const container = document.createElement("div");
  container.style.display = "inline-block";
  container.style.width = "300px";
  container.style.height = "300px";
  container.style.overflow = "scroll";
  container.style.position = "relative";
  const textHolders: HTMLElement[] = [];
  for (let i = 0; i < 50; i++) {
    const holder = document.createElement("pre");
    holder.style.width = "300px";
    holder.style.overflow = "hidden";
    holder.style.position = "absolute";
    holder.style.left = "0px";
    holder.style.whiteSpace = "pre";
    holder.style.lineHeight = "12px";
    holder.style.fontSize = "10px";
    textHolders.push(holder);
  }

  const lines: string[] = [];

  changeFeed$.subscribe({
    next(val) {
      lines.push(JSON.stringify(val));
    },
    error(err) {
      lines.push(err.stack);
    },
    complete() {
      lines.push("complete");
    }
  });

  let position = 0;
  let i = 0;

  console.log("text holders", textHolders, textHolders[0]);

  setInterval(() => {
    const newLines = lines.splice(0);
    const holder = textHolders[i];

    // console.log("i", i);

    holder.innerText = newLines.join("\n");
    holder.style.height = newLines.length * 12 + "px";
    holder.style.top = position + "px";

    position += newLines.length * 12;

    if (!holder.parentNode) {
      container.appendChild(holder);
    }

    i = (i + 1) % textHolders.length;
  }, 60);

  return container;
};
