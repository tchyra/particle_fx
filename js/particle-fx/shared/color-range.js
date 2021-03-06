﻿
class Color {

    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static fromHex(hex) {

        let offset = hex.startsWith('#') ? 1 : 0;

        let r, g, b;

        if (hex.length > 4) {

            r = parseInt('0x' + hex.substr(offset, 2));
            g = parseInt('0x' + hex.substr(offset + 2, 2));
            b = parseInt('0x' + hex.substr(offset + 4, 2));

        } else {

            let dup = c => c + c;

            r = parseInt('0x' + dup(hex.substr(offset + 0, 1)));
            g = parseInt('0x' + dup(hex.substr(offset + 1, 1)));
            b = parseInt('0x' + dup(hex.substr(offset + 2, 1)));

        }

        return new Color(r, g, b);
    }

    toHexString() {
        return '#' + this.r.toString(16).padStart(2, 0)
            + this.g.toString(16).padStart(2, 0)
            + this.b.toString(16).padStart(2, 0);
    }

    toString() {
        return `rgb(${this.r},${this.g},${this.b})`
    }
}

class ColorRange {

    constructor(from, to) {

        if (typeof from === 'string')
            this.from = Color.fromHex(from);
        else
            this.from = from;

        if (typeof to === 'string')
            this.to = Color.fromHex(to);
        else
            this.to = to;

        this.refreshRGBRanges();
    }

    refreshRGBRanges() {
        this.rRange = new Range(this.from.r, this.to.r);
        this.gRange = new Range(this.from.g, this.to.g);
        this.bRange = new Range(this.from.b, this.to.b);
    }

    roll() {
        return new Color(this.rRange.rollInt(), this.gRange.rollInt(), this.bRange.rollInt());
    }

    lerp(fraction) {
        fraction = Math.max(0, Math.min(fraction, 1));
        return new Color(this.rRange.lerp(fraction), this.gRange.lerp(fraction), this.bRange.lerp(fraction));
    }
}
