import { html, render } from "lit-html";
import { controllsStory } from "./ui/controlls.story";

const stories = () =>
    html`
        ${controllsStory()}
    `;

render(stories(), document.getElementById("root")!);
