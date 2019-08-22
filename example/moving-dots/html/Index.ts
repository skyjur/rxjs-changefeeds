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
      <div class="content">
        <p>
          Filter changefeed using observable filter function.
        </p>
        <p>
          Note how items are deleted from changefeed (using quarter filtering)
          when their updated values no longer match the filter and how they
          appear if their values match the filter.
        </p>
      </div>
      ${props.filtering}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <h2 class="title is-4 is-spaced">Group by</h2>

      <div class="content">
        <p>
          Group changfeed using key producing function. Result is
          <span>Map()</span>
          where each result of key function, and value is a new changefeed
          filtered by matching values.
        </p>
        <p>
          Note how values are deleted from group when their grouping key changes
          and move on different group. And how group's changefeed is completed
          once no more items are in it thus releasing any listeners.
        </p>
      </div>
      ${props.grouping}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <h2 class="title is-4 is-spaced">Sorted list</h2>

      <div class="content">
        <p>
          Transform changfeed into sorted list using comparison function where
          each row is observable of value in the changefeed.<br /><br />
        </p>
      </div>

      ${props.sorting}
    </section>
  `;
};
