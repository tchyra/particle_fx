
class Color {

    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static fromHex(hex) {

        let offset = hex.startsWith('#') ? 1 : 0;
        let r = parseInt('0x' + hex.substr(offset, 2));
        let g = parseInt('0x' + hex.substr(offset + 2, 2));
        let b = parseInt('0x' + hex.substr(offset + 4, 2));

        return new Color(r, g, b);
    }

    toString() {
        return `rgb(${this.r},${this.g},${this.b})`
    }
}

class ColorRange {
    constructor(from, to) {

        if (typeof from === 'string')
            from = Color.fromHex(from);

        if (typeof to === 'string')
            to = Color.fromHex(to);

        this.rRange = new Range(from.r, to.r);
        this.gRange = new Range(from.g, to.g);
        this.bRange = new Range(from.b, to.b);
    }

    roll() {
        return new Color(this.rRange.rollInt(), this.gRange.rollInt(), this.bRange.rollInt());
    }

    lerp(fraction) {
        return new Color(this.rRange.lerp(fraction), this.gRange.lerp(fraction), this.bRange.lerp(fraction));
    }
}
