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
      <h1 class="title">rxjs-changefeed example</h1>
    </header>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container content">
      <h2 class="title is-4 is-spaced">
        Input feed generator
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
      <a name="feedFilter"></a>
      <h2 class="title is-4 is-spaced">
        Filtering
        <a
          href="https://github.com/skyjur/rxjs-changefeeds/blob/master/example/moving-dots/index.ts#L47"
          ><small class="is-size-7">code</small></a
        >
        <a
          href="https://github.com/skyjur/rxjs-changefeeds#feedfilter-filterfunction-"
          ><small class="is-size-7">doc</small></a
        >
      </h2>
      ${props.filtering}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <a name="feedGroupBy"></a>
      <h2 class="title is-4 is-spaced">
        Group by
        <a
          href="https://github.com/skyjur/rxjs-changefeeds/blob/master/example/moving-dots/index.ts#L32"
          ><small class="is-size-7">code</small></a
        >
        <a
          href="https://github.com/skyjur/rxjs-changefeeds#feedgroupby-keyfunction-"
          ><small class="is-size-7">doc</small></a
        >
      </h2>
      ${props.grouping}
    </section>

    <hr class="hr" style="margin-bottom: 0;" />

    <section class="container">
      <a name="feedSortedList"></a>
      <h2 class="title is-4 is-spaced">
        Sorted list
        <a
          href="https://github.com/skyjur/rxjs-changefeeds/blob/master/example/moving-dots/index.ts#L38"
          ><small class="is-size-7">code</small></a
        >
        <a
          href="https://github.com/skyjur/rxjs-changefeeds#feedsortedlist-comparator-options-"
          ><small class="is-size-7">code</small></a
        >
      </h2>

      ${props.sorting}
    </section>
  `;
};
