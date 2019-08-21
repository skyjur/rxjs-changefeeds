import { rxReplace } from "../../../directives/rxReplace";
import { cacheResult } from "../../../directives/cacheResult";
import { ChangeFeed$, ChangeFeed } from "../../../../src/types";
import { Context } from "../Context";
import { render, NodePart, directive } from "lit-html";
import { Unsubscribable, of, concat } from "rxjs";

export const RawChangeFeed = (changeFeed$: ChangeFeed$<any>) =>
  cacheResult(changeFeed$, () => _RawChangeFeed(changeFeed$));

interface Options {
  height?: number;
}

interface State {
  _container?: HTMLElement;
  _feed?: ChangeFeed$<any>;
  _top?: number;
  _sub?: Unsubscribable;
  _renderInterval?: any;
}

export const _RawChangeFeed = directive(
  (changeFeed$: ChangeFeed$<any>, opts: Options = {}) => (
    part: NodePart & State
  ) => {
    if (part._feed === changeFeed$) {
      return;
    }

    if (part._sub) {
      part._sub.unsubscribe();
      delete part._sub;
    }

    if (part._renderInterval) {
      clearInterval(part._renderInterval);
      delete part._renderInterval;
    }

    if (!part._top) {
      part._top = 0;
    }

    const container = part._container || _createContainer(opts);

    if (!part._container) {
      part.setValue(container);
      part._container = container;
    }

    const lineRenderScheduler = new LineRenderScheduler();
    type Line = {
      lineNode: LineNode;
      time: number;
    };
    const lines: Line[] = [];
    const index = new Map();

    part._renderInterval = setInterval(
      () => lineRenderScheduler.nextFrame(),
      100
    );

    part._sub = concat(
      of("", "// Connected to new observable", ""),
      changeFeed$,
      of("", "// Observable has completed", "")
    ).subscribe({
      next(record) {
        const [op, key] = record;
        const time = Date.now();
        if (
          op === "set" &&
          index.has(key) &&
          lines[index.get(key)].time > time - 2000
        ) {
          const i = index.get(key);
          lines[i].lineNode.update(record);
          lines[i].time = Date.now();
        } else {
          const lineNode = new LineNode(
            lineRenderScheduler,
            (part._top! += 12),
            record
          );
          lineNode.appendTo(container);
          lines.push({ lineNode, time });
          if (op === "set") {
            index.set(key, lines.length - 1);
          } else if (op === "del") {
            index.delete(key);
          }
        }
      },
      error(err) {
        this.next!(["error", err.message] as any);
      }
    });
  }
);

const containerCss = "raw-chagnefeed-container";
const lineCss = "raw-changefeed-line";

const _createContainer = ({ height = 200 }: Options) => {
  const d = document.createElement("div");
  d.className = containerCss;
  d.innerHTML = `
      <style>
        .${containerCss} {
          height: ${height}px;
          position: relative;
          font-size: 10px;
          overflow-y: scroll;
          overflow-x: hidden;
          font-family: monospace;
        }
        .${lineCss} {
          line-height: 12px;
          position: absolute;
          left: 0px;
          overflow: hidden;
          white-space: pre;
        }
      </style>
    `;
  return d;
};

class LineRenderScheduler {
  private scheduled = new Set<LineNode>();

  schedule(lineNode: LineNode) {
    this.scheduled.add(lineNode);
  }

  nextFrame() {
    for (const val of this.scheduled) {
      val.render();
    }
    this.scheduled.clear();
  }
}

class LineNode {
  private node: HTMLElement;
  private textNode: Text;
  private updateCount = 1;
  private value: any;
  private renderTimeout?: any;

  constructor(
    private renderScheduler: LineRenderScheduler,
    top: number,
    value: any
  ) {
    const d = document.createElement("div");
    d.className = lineCss;
    d.style.top = top + "px";
    this.value = value;
    this.textNode = document.createTextNode("");
    d.appendChild(this.textNode);
    this.node = d;
    this.render();
  }

  update(value: any) {
    this.value = value;
    this.renderScheduler.schedule(this);
  }

  render() {
    let { textNode, value } = this;
    let text = typeof value === "string" ? value : JSON.stringify(value);
    // shorten long numbers:
    text = text.replace(/\d\.\d{9,}/g, match => match.substr(0, 5) + "…");
    textNode.textContent = text;
  }

  appendTo(container: HTMLElement) {
    container.appendChild(this.node);
    container.scrollTo(0, this.node.offsetTop);
  }
}
