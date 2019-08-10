import { deepStrictEqual, strictEqual as equal } from "assert"
import { AZSequenceGenerator } from "./SequenceGenerator";

describe('example/sample-data/SequenceGenerator', () => {
    it('A-Z sequence', () => {
        const gen = new AZSequenceGenerator()

        equal(gen.next(), 'A')
        equal(gen.next(), 'B')

        for (let i = 0; i < 21; i++) {
            gen.next()
        }

        equal(gen.next(), 'X')
        equal(gen.next(), 'Y')
        equal(gen.next(), 'Z')
        equal(gen.next(), 'AA')
        equal(gen.next(), 'AB')

        for (let i = 0; i < 21; i++) {
            gen.next()
        }

        equal(gen.next(), 'AX')
        equal(gen.next(), 'AY')
        equal(gen.next(), 'AZ')
        equal(gen.next(), 'BA')
    })
})