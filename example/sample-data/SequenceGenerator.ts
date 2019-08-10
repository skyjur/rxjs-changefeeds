const iA = 'A'.charCodeAt(0)
const iZ = 'Z'.charCodeAt(0)
const n = iZ - iA + 1

export class AZSequenceGenerator {
    constructor(private startValue: number = 1) { }

    next() {
        let value = this.startValue++;
        let s = ''
        while (value > 0) {
            s = String.fromCharCode(
                (iA + ((value - 1) % n))
            ) + s
            value = Math.floor((value - 1) / n)
        }
        return s || 'A'
    }
}
