export function controlledInterval<T extends IHasId>(inputs: {
    pause$: Observable<boolean>
    interval$: Observable<number>,
}) {
    return combineLatest(inputs.pause$, inputs.interval$).pipe(
        switchMap(([pauseValue, intervalValue]) => {
            return pauseValue
                ? NEVER
                : interval(intervalValue);
        }),
    );
}
