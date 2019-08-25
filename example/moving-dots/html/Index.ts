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
      <h1 class="title">Example of changefeed operators use</h1>
      <p class="subtitle">
        My hope is that this example will demonstrate how changefeed operators
        can be useful in practice.
      </p>
    </header>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container content">
      <h2 class="title is-4 is-spaced">
        Input feed
        <a
          href="https://github.com/skyjur/rxjs-changefeeds/blob/master/example/moving-dots/index.ts#L22"
          ><small class="is-size-7">code</small></a
        >
      </h2>
      <p>
        Source changfeed observable is made of points of fixed color that report
        position every specified interval. All further examples apply operations
        on this input feed.
      </p>
      ${props.input}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <h2 class="title is-4 is-spaced">
        Filtering
        <a
          href="https://github.com/skyjur/rxjs-changefeeds/blob/master/example/moving-dots/index.ts#L47"
          ><small class="is-size-7">code</small></a
        >
      </h2>
      <div class="content">
        <p>
          Filter changefeed using observable filter function.
        </p>
        <p>
          It's different from regular
          <a
            href="https://www.learnrxjs.io/operators/filtering/filter.html"
            target="_blank"
            >filter operator</a
          >
          in way that where regular filter operator would just exclude all
          events that don't match given filter, this changefeed specific filter
          operator will convert <code>"set"</code> events into
          <code>"del"</code> events when older values matched the filter but new
          value no longer match the filter function. This can be seen in action
          by toggling quarter selection.<br />
        </p>
        <p>
          <code>feedGroupBy</code> can be used to get options as is done here to
          only display available shades in the feed.
        </p>
      </div>
      ${props.filtering}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <h2 class="title is-4 is-spaced">
        Group by
        <a
          href="https://github.com/skyjur/rxjs-changefeeds/blob/master/example/moving-dots/index.ts#L32"
          ><small class="is-size-7">code</small></a
        >
      </h2>

      <div class="content">
        <p>
          Group events using a key. Result is observable of
          <code>${"Map<Key, Observable<ChangeFeed>>"}</code>
          where each result of key function, and value is a new changefeed
          filtered by matching key.
        </p>
        <p>
          Difference from regular
          <a
            href="https://www.learnrxjs.io/operators/transformation/groupby.html"
            target="_blank"
            >groupBy</a
          >
          is that <code>"set"</code> events are converted to
          <code>"del"</code> events when computed key changes.
        </p>
      </div>
      ${props.grouping}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <h2 class="title is-4 is-spaced">
        Sorted list
        <a
          href="https://github.com/skyjur/rxjs-changefeeds/blob/master/example/moving-dots/index.ts#L38"
          ><small class="is-size-7">code</small></a
        >
      </h2>

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
