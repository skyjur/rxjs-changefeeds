import { Context } from "./Context";
import { SortedPoints } from "./sections/sorting";
import { Filtering } from "./sections/filtering";

interface IndexProps {
  input: any;
  grouping: any;
  sorting: any;
  filtering: any;
}

export const Index = ({ html }: Context, props: IndexProps) => {
  return html`
    <section class="container">
      <h2 class="title">Input</h2>
      ${props.input}
    </section>

    <section class="container">
      <h2 class="title">Group by quarter</h2>
      ${props.grouping}
    </section>

    <section class="container">
      <h2 class="title">Sorted points by Point.x</h2>
      ${props.sorting}
    </section>

    <section class="container">
      <h2 class="title">Filtering</h2>
      ${props.filtering}
    </section>
  `;
};
