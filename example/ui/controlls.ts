import { html } from "lit-html";
import {Subject} from "rxjs";

export const intervalInput = (value: number, onInput: (value: number) => void) =>
    html`
    <input type="range" min="0" max="1000" step="1"
        @change=${(e: any) => onInput(parseInt(e.target.value, 10))}
        value=${value}>
    `;

export const playButton = (paused: boolean, onClick: () => void) =>
    html`
    <button @onClick=${onClick}>
        ${paused ? "Play" : "Pause"}
    </button>`;
