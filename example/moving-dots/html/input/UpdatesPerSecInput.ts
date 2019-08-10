import { BehaviorSubject } from "rxjs";
import { Context } from "../Context";

export const UpdatesPerSecInput = (
  { html, rxReplace }: Context,
  subject: BehaviorSubject<number>
) =>
  rxReplace(
    subject,
    value =>
      html`
        <div>
          <input
            type="range"
            @input=${bindOnInput(subject)}
            min="0"
            max=${scaleIn(1000)}
            value=${scaleIn(value)}
          />
          ${value}
        </div>
      `
  );

const bindOnInput = (subject: BehaviorSubject<number>) => {
  return (e: HTMLInputElementEvent) => {
    subject.next(scaleOut(parseInt(e.target.value, 10)));
  };
};

const scaleOut = (input: number) => Math.floor(Math.pow(input, 2) / 1000);

const scaleIn = (output: number) => Math.ceil(Math.pow(output * 1000, 0.5));
