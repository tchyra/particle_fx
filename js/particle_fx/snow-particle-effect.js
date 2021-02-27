
class SnowParticleEffect extends ParticleEnv {

    static getDefaultSimulationParams() {
        // velocity is in px/s
        return {
            particles: {
                count: 20,
                sizeRange: new Range(2, 8),
                brightnessRange: new Range(255 / 5, 255),
                vyRange: new Range(1080 / 6, 1080 / 1.5),
                windFactorRange: new Range(0.3, 1)
            },
            wind: {
                vxRange: new Range(1920 / 5, 1920 / 10),
                holdDurRange: new Range(0.5, 2),
                transitionDurRange: new Range(1, 4),
                printStateChanges: true
            }
        };
    }

    constructor(targetCnv, params) {
        super(targetCnv);

        // run this before super because init() needs those properties
        this.params = params || SnowParticleEffect.getDefaultSimulationParams();

        this.start();
        this._reqNextFrame();
    }

    _createParticle() {

        function getGreyRGBString(greyVal) {
            return `rgb(${[greyVal, greyVal, greyVal].join(',')})`
        }

        // particle params shorthand
        const pp = this.params.particles;

        const p = {
            x: Math.random() * this.cnvw,
            y: Math.random() * this.cnvh,
            vx: 0,
            size: pp.sizeRange.roll(),
            color: getGreyRGBString(pp.brightnessRange.roll())
        };

        p.vy = pp.vyRange.lerp(1 - pp.sizeRange.getFraction(p.size));
        //p.vy = (pp.vyRange.max - (p.size - pp.sizeRange.min) / pp.sizeRange.span * pp.vyRange.span) + pp.vyRange.min;

        return p;
    }

    _drawParticle(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    _rollWind() {

        let prevVx = this.wind ? this.wind.nextVx || 0 : 0;

        this.wind = {
            prevVx,
            nextVx: this.params.wind.vxRange.roll(),
            transitionDur: this.params.wind.transitionDurRange.roll(),
            holdDur: this.params.wind.holdDurRange.roll(),
            state: 't'
        };

        this.wind.currentVx = prevVx;

        this.wind.remaining = this.wind.transitionDur;
    }

    _printWindState() {
        if (!this.params.wind.printStateChanges) return;

        // quick helper function for printing
        let toFixedFloat = (f, n) => parseFloat(f.toFixed(n));

        if (this.wind.state === 'h')
            console.log('[WIND] hold', toFixedFloat(this.wind.currentVx, 2), this.wind.holdDur.toFixed(2) + 's');
        else if (this.wind.state === 't')
            console.log('[WIND] trns', toFixedFloat(this.wind.prevVx, 2), ' => ', toFixedFloat(this.wind.nextVx, 2), this.wind.transitionDur.toFixed(2) + 's');

    }

    start() {
        this.particles = new Array(this.params.particles.count);

        // create particles
        for (var i = 0; i < this.params.particles.count; i++) {
            this.particles[i] = this._createParticle();
            this._drawParticle(this.particles[i]);
        }

        // start the wind system
        this._rollWind();
        this._printWindState();
    }

    frame(deltaTime, deltaTimeS, frameNo) {

        // skip the frame if more than 500ms elapsed since the last frame, the most likely cause of this is slowing animation framerate when the browser window is in the background.
        if (deltaTime > 500) return;

        //
        // WIND SYSTEM
        //

        // decrease remaining by deltaTime in seconds
        this.wind.remaining -= deltaTimeS;

        // check if the current wind phase should end
        if (this.wind.remaining <= 0) {

            if (this.wind.state == 't') {

                // transition phase ended, start hold phase
                this.wind.state = 'h';
                this.wind.prevVx = this.wind.currentVx = this.wind.nextVx;
                this.wind.remaining = this.wind.holdDur;

                // print information about the new wind phase
                this._printWindState();

            } else {
                // hold phase ended, start transiton phase
                this._rollWind();
                this._printWindState();
            }
        } else if (this.wind.state == 't') {

            // windPrevVx    -> windNextVx
            // windRemaining -> 0
            // invert windRemaining so it goes from 0 -> windTransitionDur
            let windVxRange = new Range(this.wind.prevVx, this.wind.nextVx);
            let windDurRange = new Range(this.wind.transitionDur, 0);

            this.wind.currentVx = windVxRange.lerp(windDurRange.getFraction(this.wind.remaining));
            //this.wind.currentVx = (this.wind.nextVx - this.wind.prevVx) * (this.wind.transitionDur - this.wind.remaining) / this.wind.transitionDur + this.wind.prevVx;
        }

        //
        // PARTICLES
        //

        this.ctx.clearRect(0, 0, this.cnvw, this.cnvh); // clear the canvas

        let p;
        for (var i = 0; i < this.params.particles.count; i++) {

            p = this.particles[i];

            // each particle has a vy
            p.y += p.vy * deltaTimeS;

            // particle vx is a function of wind vx and particle size
            //p.vx = this.params.particles.windFactorRange.lerp(this.params.particles.sizeRange.getFraction(p.size));
            p.vx = this.wind.currentVx * ((p.size - this.params.particles.sizeRange.min) / this.params.particles.sizeRange.span * this.params.particles.windFactorRange.max + this.params.particles.windFactorRange.min);

            // particle vx is a function of wind vx
            p.x += p.vx * deltaTimeS;

            if (p.vy > 0) {
                // particle is falling down, check if below screen
                if (p.y - p.size > this.cnvh) {
                    p.y = -p.size; // teleport to top of screen
                }
            }
            else if (p.vy < 0) {
                // particle is falling up, check if above screen
                if (p.y + p.size < this.cnvh)
                    p.y = this.cnvh + p.size; // teleport to bottom of screen
            }

            if (p.vx > 0) {

                // particle is going to the right, check if off-screen
                if (p.x - p.size > this.cnvw)
                    p.x = -p.size; // teleport to the left edge

            } else if (p.vx < 0) {

                // particle is going to the left, check if off-screen
                if (p.x + p.size < 0)
                    p.x = this.cnvw + p.size; // teleport to the right edge

            }

            this._drawParticle(p);
        }
    }
}
