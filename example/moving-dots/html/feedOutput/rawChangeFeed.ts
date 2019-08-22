import { rxReplace } from "../../../directives/rxReplace";
import { cacheResult } from "../../../directives/cacheResult";
import { ChangeFeed$, ChangeFeed } from "../../../../src/types";
import { Context } from "../Context";
import { render, NodePart, directive } from "lit-html";
import { Unsubscribable, of, concat } from "rxjs";
import { isElementOutOfVisibleScreen } from "../utils";
import { stat } from "fs";

interface Options {
  height?: number;
  width?: number;
}

interface State {
  container?: HTMLElement;
  feed?: ChangeFeed$<any>;
  top?: number;
  sub?: Unsubscribable;
  renderInterval?: any;
  lines?: (LineNode | null)[];
}

const lineHeight = 12;

export const RawChangeFeed = directive(
  (changeFeed$: ChangeFeed$<any>, opts: Options = {}) => (
    part: NodePart & { _state: State }
  ) => {
    const state = (part._state = part._state || {});

    if (state.feed === changeFeed$) {
      return;
    }

    if (state.sub) {
      state.sub.unsubscribe();
      delete state.sub;
    }

    if (state.renderInterval) {
      clearInterval(state.renderInterval);
      delete state.renderInterval;
    }

    if (!state.top) {
      state.top = 0;
    }

    const container = state.container || _createContainer(opts);

    if (!state.container) {
      part.setValue(container);
      state.container = container;
    }

    const lines: (LineNode | null)[] = (state.lines = state.lines || []);
    const index = new Map();

    let lastAddedLine = 0;

    let userLastScrollTime = 0;

    container.onscroll = () => {
      userLastScrollTime = Date.now();
    };

    state.renderInterval = setInterval(() => {
      if (!isElementOutOfVisibleScreen(container, window)) {
        if (lastAddedLine < lines.length) {
          const isAtBottom =
            container.scrollHeight <=
            container.clientHeight + container.scrollTop + 10;

          const fragment = new DocumentFragment();

          while (lastAddedLine < lines.length) {
            const line = lines[lastAddedLine++];
            if (line) {
              line.render();
              fragment.appendChild(line.node);
            }
          }

          container.appendChild(fragment);

          if (isAtBottom) {
            container.scrollTop = state.top!;
          }
        }

        const updateFrom = Math.floor(container.scrollTop / lineHeight);
        const updateTo =
          updateFrom + Math.ceil(container.clientHeight / lineHeight);

        for (let i = updateFrom; i <= updateTo; i++) {
          const line = lines[i];
          if (line) {
            line.render();
          }
        }

        for (let i = lines.length - 300; i >= 0 && lines[i]; i--) {
          const line = lines[i];
          if (line) {
            container.removeChild(line.node);
            lines[i] = null;
          }
        }
      }
    }, 100);

    state.sub = concat(
      of("", "// Connected to new observable"),
      changeFeed$,
      of("// Observable has completed", "")
    ).subscribe({
      next(record) {
        const [op, key] = record;
        const i = op === "set" ? index.get(key) : undefined;
        const line =
          i !== undefined && lines[i]
            ? lines[i]!
            : new LineNode(container, (state.top! += lineHeight), opts);

        line.update(record);

        if (i === undefined) {
          if (op === "set") {
            index.set(key, lines.length);
          }
          lines.push(line);
        }

        if (op === "del") {
          index.delete(key);
        }
      },
      error(err) {
        this.next!(["error", err.message] as any);
      },
      complete() {
        index.clear();
      }
    });
  }
);

const containerCss = "raw-changefeed-container";
const lineCss = "raw-changefeed-line";
const containerStyle = `
<style>
  .${containerCss} {
    position: relative;
    font-size: 10px;
    overflow: scroll;
    font-family: monospace;
    overflow: scroll;
  }
  .${containerCss}::-webkit-scrollbar {
    width: 3px;
    height: 0px;
  }
  .${containerCss}::-webkit-scrollbar-track
  {
    background: rgba(0, 0, 0, 0.1);
  }
  .${containerCss}::-webkit-scrollbar-thumb
  {
    background: rgba(0, 0, 0, 0.5);
  }
  .${lineCss} {
    line-height: ${lineHeight}px;
    height: ${lineHeight}px;
    position: absolute;
    left: 0px;
    overflow: hidden;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .${lineCss}:hover {
    background: rgba(230, 230, 230);
    height: auto;
    white-space: normal;
    word-break: break-all;
    z-index: 1;
  }
</style>
`;

const defaultWidth = 250;
const defaultHeight = 200;

const _createContainer = ({
  height = defaultHeight,
  width = defaultWidth
}: Options) => {
  const d = document.createElement("div");
  d.className = containerCss;
  d.style.width = `${width}px`;
  d.style.height = `${height}px`;
  d.innerHTML = containerStyle;
  return d;
};

class LineRenderScheduler {
  private scheduled = new Set<LineNode>();
  private scheduledOrdered: LineNode[] = [];

  schedule(lineNode: LineNode) {
    if (!this.scheduled.has(lineNode)) {
      this.scheduled.add(lineNode);
      this.scheduledOrdered.push(lineNode);
    }
  }

  nextFrame() {
    for (const val of this.scheduledOrdered) {
      val.render();
    }
    this.scheduled.clear();
    this.scheduledOrdered = [];
  }
}

class LineNode {
  public node: HTMLElement;
  private textNode: Text;
  private updateCount = 1;
  private value: any;
  private renderTimeout?: any;
  timeUpdated = Date.now();

  constructor(
    private parent: HTMLElement,
    top: number,
    { width = defaultWidth }: Options
  ) {
    const d = document.createElement("div");
    d.className = lineCss;
    d.style.top = top + "px";
    d.style.width = width - 6 + "px";
    this.textNode = document.createTextNode("");
    d.appendChild(this.textNode);
    this.node = d;
  }

  update(value: any) {
    this.timeUpdated = Date.now();
    this.value = value;
  }

  render() {
    let { textNode, value } = this;
    let text = typeof value === "string" ? value : JSON.stringify(value);
    // shorten long numbers:
    text = text.replace(/\d\.\d{9,}/g, match => match.substr(0, 5) + "…");
    textNode.textContent = text;
  }
}
