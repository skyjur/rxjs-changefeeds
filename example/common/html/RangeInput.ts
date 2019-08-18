import { BehaviorSubject } from "rxjs";
import { Context } from "../../moving-dots/html/Context";

export interface RangeScale {
  min: number;
  max: number;
  in(value: number): number;
  out(value: number): number;
}

export const RangeInput = (
  { html, rxReplace }: Context,
  subject: BehaviorSubject<number>,
  scale: RangeScale
) =>
  rxReplace(
    subject,
    value =>
      html`
        <input
          class="slider has-output is-info"
          type="range"
          @input=${inputHandler(subject, scale.out)}
          min=${scale.in(scale.min)}
          max=${scale.in(scale.max)}
          value=${scale.in(value)}
        />
        <output>
          ${value}
        </output>
      `
  );

const inputHandler = (
  subject: BehaviorSubject<number>,
  scaleOut: (x: number) => any
) => (e: HTMLInputElementEvent) => {
  subject.next(scaleOut(parseInt(e.target.value, 10)));
};
