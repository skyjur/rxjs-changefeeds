import { ChangeFeed$ } from "../types";
interface FeedCombine {
    <A, B, R>(input: [ChangeFeed$<A>, ChangeFeed$<B>], project: (obj1: A, obj2: B) => R): ChangeFeed$<R>;
    <A, B, C, R>(input: [ChangeFeed$<A>, ChangeFeed$<B>, ChangeFeed$<C>], project: (obj1: A, obj2: B, obj3: C) => R): ChangeFeed$<R>;
    <A, B, C, D, R>(input: [ChangeFeed$<A>, ChangeFeed$<B>, ChangeFeed$<C>, ChangeFeed$<D>], project: (obj1: A, obj2: B, obj3: C, obj4: D) => R): ChangeFeed$<R>;
    <A, B, C, D, E, R>(input: [ChangeFeed$<A>, ChangeFeed$<B>, ChangeFeed$<C>, ChangeFeed$<D>, ChangeFeed$<E>], project: (obj1: A, obj2: B, obj3: C, obj4: D, obj5: E) => R): ChangeFeed$<R>;
    <R>(input: Array<ChangeFeed$<any>>, project: (...args: any[]) => R): ChangeFeed$<R>;
}
export declare const feedCombine: FeedCombine;
export {};
