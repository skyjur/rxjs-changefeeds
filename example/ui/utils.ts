import { directive, html } from "lit-html";

export const blinkOnChange = directive((value) => (part: any) => {
    if (part._value !== value) {
        part._value = value
        part.setValue("blink");
        part.commit();
        setTimeout(() => {
            part.setValue("");
            part.commit();
        }, 500);
    }
});
