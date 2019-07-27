import { directive, html } from "lit-html";

const blinkTemplate = (on: any, value: any) =>
    html`<style>
    .blink {
        background-color: green;
        transition: background-color 0.5s;
    }
    </style>
    <span class=${on ? "blink" : ""}>${value}</span>`;

export const blink = directive((value) => (part: any) => {
    part.setValue(blinkTemplate(true, value));
    part.commit();
    setTimeout(() => {
        part.setValue(blinkTemplate(false, value));
        part.commit();
    }, 500);
});
