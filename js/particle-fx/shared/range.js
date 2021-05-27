
class Range {

    static randomBell() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) return this.randomBell(); // resample between 0 and 1
        return num;
    }

    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    get span() {
        return this.max - this.min;
    }

    roll() {
        return Math.random() * this.span + this.min;
    }

    rollInt() {
        return Math.floor(this.roll());
    }

    lerp(fraction) {
        return this.min + this.span * fraction;
    }

    getFraction(value) {
        if (this.span === 0)
            return 0;
        else
            return (value - this.min) / this.span;
    }

    clamp(value) {
        let min = Math.min(this.min, this.max);
        let max = Math.max(this.min, this.max);
        return Math.max(min, Math.min(value, max));
    }

    static roll(min, max) {
        return Math.random() * (max - min) + min;
    }

    static rollBell(min, max) {
        return Range.randomBell() * (max - min) + min;
    }

    static lerp(min, max, fraction) {
        return min + (max - min) * fraction;
    }

    static clamp(min, max, value) {
        let a = Math.min(min, max);
        let b = Math.max(min, max);
        return Math.max(a, Math.min(value, b));
    }
}
