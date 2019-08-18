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
    <header>
      <h1 class="title">Circling dots</h1>
      <p class="subtitle">
        Examples illustrating changefeeds handling with rx-js-changfeeds usage.
      </p>
    </header>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container content">
      <h2 class="title is-4 is-spaced">Input feed</h2>
      <p>
        Source changfeed that is used in later examples is made of points of
        fixed color that report position every specified interval.
      </p>
      ${props.input}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <h2 class="title is-4 is-spaced">Filtering</h2>
      ${props.filtering}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <h2 class="title is-4 is-spaced">Group by</h2>
      ${props.grouping}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <h2 class="title is-4 is-spaced">Sorted list</h2>
      ${props.sorting}
    </section>
  `;
};
