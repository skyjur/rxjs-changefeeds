import { ChangeFeed } from "./types";

export interface ChangeFeedHandler<T> {
    initializing(): void
    ready(): void
    set(key: string, value: T): void
    del(key: string): void
}

export function changeFeedHandler<T>(handler: ChangeFeedHandler<T>): (record: ChangeFeed<T>) => void {
    return (record: ChangeFeed<T>) => {
        switch(record[0]) {
            case 'initializing':
                handler.initializing()
                break
            case 'ready':
                handler.ready()
                break
            case 'set':
                handler.set(record[1], record[2])
                break
            case 'del':
                handler.del(record[1])
                break
            default:
                throw new Error(`Invalid changefeed operation: ${record[0]}`)
        }
    }
}