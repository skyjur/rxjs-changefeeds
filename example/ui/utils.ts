import { directive, html } from "lit-html";

export const blink = directive((value) => (part: any) => {
    const t = (on: any) =>
        html`<style>
        .blink {
            background-color: green;
            transition: background-color 0.5s;
        }
        </style>
        <span class=${on ? "blink" : ""}>${value}</span>`;
    part.setValue(t(true));
    setTimeout(() => {
        part.setValue(t(false));
        part.commit();
    }, 500);
});
