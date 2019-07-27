import { of } from "rxjs";
import { deepStrictEqual } from "assert";
import { feedFilterRx } from "./feedFilterRx"
import { TestScheduler } from "rxjs/testing";
import { ChangeFeed, ChangeFeed$ } from "../types";


describe("operators/feedFilterRx", () => {
    it("only valid values pass", () => {
        const scheduler = new TestScheduler(deepStrictEqual)
        scheduler.run(({expectObservable}) => {
            const predicate$ = of((value: number) => value <= 2);

            const values: {[key: string]: ChangeFeed<number, string>} = {
                a: ['set', 'key1', 1],
                b: ['set', 'key2', 2],
                c: ['set', 'key3', 3]
            }

            const input$: ChangeFeed$<number, string> = scheduler.createColdObservable(
                'abc|', values
            )
            
            const output: ChangeFeed$<number, string> = input$.pipe(
                    feedFilterRx(predicate$)
                );
                
            expectObservable(output).toBe('ab-|', values)
        })
    })

    it("previously valid values are removed", () => {
        const scheduler = new TestScheduler(deepStrictEqual)
        scheduler.run(({expectObservable}) => {
            const predicate$ = of((value: number) => value === 1);

            const values: {[key: string]: ChangeFeed<number, string>} = {
                a: ['set', 'key1', 1],
                b: ['set', 'key1', 2],
                d: ['del', 'key1']
            };

            const input$: ChangeFeed$<number, string> = scheduler.createColdObservable(
                'ab|', values
            );

            const output$ = input$.pipe(
                feedFilterRx(predicate$)
            );

            expectObservable(output$).toBe('ad|', values)
        })
    })

    it("updated predicate triggers del on previously included keys", () => {
        const scheduler = new TestScheduler(deepStrictEqual)
        scheduler.run(({expectObservable}) => {
            const predicate$ = scheduler.createColdObservable(
                'a-b-|', {
                    a: (value: any) => true,
                    b: (value: any) => false,
                }
            )

            const input$: ChangeFeed$<number, string> = scheduler.createColdObservable(
                'a---|', {
                    a: ['set', 'key1', 1]
                }
            );

            const output$ = input$.pipe(
                feedFilterRx(predicate$)
            );

            expectObservable(output$).toBe('a-b-|', {
                a: ['set', 'key1', 1],
                b: ['del', 'key1']
            })
        })
    })

    it("updated predicate triggers set on previously excluded values", () => {
        const scheduler = new TestScheduler(deepStrictEqual)
        scheduler.run(({expectObservable}) => {
            const predicate$ = scheduler.createColdObservable(
                'a-b-|', {
                    a: (value: any) => false,
                    b: (value: any) => true,
                }
            )

            const input$: ChangeFeed$<number, string> = scheduler.createColdObservable(
                'a---|', {
                    a: ['set', 'key1', 1]
                }
            );

            const output$ = input$.pipe(
                feedFilterRx(predicate$)
            );

            expectObservable(output$).toBe('--a-|', {
                a: ['set', 'key1', 1],
            })
        })
    })
})