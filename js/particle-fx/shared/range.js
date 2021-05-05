
class Range {
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

    static roll(min, max) {
        return Math.random() * (max - min) + min;
    }
}
