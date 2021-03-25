
class RainParticleEffect extends ParticleEnv {

    static getDefaultSimulationParams() {
        return {
            particles: {
                count: 50,
                sizeRange: new Range(1, 4),
                colorRange: new ColorRange('#527A91', '#2E3D89'),
                vyRange: new Range(2160, 771),
                windFactorRange: new Range(0.3, 1),
                length: 0.1
            },
            wind: {
                vxRange: new Range(1920 / 10, 1920 / 1),
                holdDurRange: new Range(0.5, 2),
                transitionDurRange: new Range(1, 4),
                printStateChanges: false
            }
        };
    }

    constructor(targetCnv, params) {
        super(targetCnv, params);
    }

    _createParticle() {

        // particle params shorthand
        const pp = this.params.particles;

        const p = {
            x: Math.random() * this.cnvw,
            y: Math.random() * this.cnvh,
            vx: 0,
            size: pp.sizeRange.roll(),
            color: pp.colorRange.roll()
        };

        p.vy = pp.vyRange.lerp(1 - pp.sizeRange.getFraction(p.size));
        //p.vy = (pp.vyRange.max - (p.size - pp.sizeRange.min) / pp.sizeRange.span * pp.vyRange.span) + pp.vyRange.min;

        return p;
    }

    _drawParticle(p) {
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = p.size;

        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - p.vx * this.params.particles.length, p.y - p.vy * this.params.particles.length);
        this.ctx.stroke();
    }

    start() {

        this.particles = new Array(this.params.particles.count);

        // create particles
        for (var i = 0; i < this.params.particles.count; i++) {
            this.particles[i] = this._createParticle();
            this._drawParticle(this.particles[i]);
        }

        this.wind = new WindSystem(this.params.wind);

        // start the wind system
        this.wind.start();
    }

    frame(deltaTime, deltaTimeS, frameNo) {

        // skip the frame if more than 500ms elapsed since the last frame, the most likely cause of this is slowing animation framerate when the browser window is in the background.
        if (deltaTime > 500) return;

        // update the wind system
        this.wind.frame(deltaTime, deltaTimeS, frameNo);

        this.ctx.clearRect(0, 0, this.cnvw, this.cnvh); // clear the canvas

        let p;
        for (var i = 0; i < this.params.particles.count; i++) {

            p = this.particles[i];

            // each particle has a vy
            p.y += p.vy * deltaTimeS;

            // particle vx is a function of wind vx and particle size
            p.vx = this.wind.currentVx * this.params.particles.windFactorRange.lerp(this.params.particles.sizeRange.getFraction(p.size));
            //p.vx = this.wind.currentVx * ((p.size - this.params.particles.sizeRange.min) / this.params.particles.sizeRange.span * this.params.particles.windFactorRange.max + this.params.particles.windFactorRange.min);

            // particle vx is a function of wind vx
            p.x += p.vx * deltaTimeS;


            if (p.vy > 0) {
                // particle is falling down, check if below screen
                if (p.y - p.vy * this.params.particles.length - p.size > this.cnvw)
                    p.y = -p.size; // teleport to top of screen
            }
            else if (p.vy < 0) {
                // particle is falling up, check if above screen
                if (p.x - p.vx * this.params.particles.length + p.size < 0)
                    p.y = this.cnvh + p.size; // teleport to bottom of screen
            }

            if (p.vx > 0) {
                // particle is going to the right, check if off-screen
                if (p.x - p.vx * this.params.particles.length - p.size > this.cnvw)
                    p.x = -p.size;// teleport to the left edge

            } else if (p.vx < 0) {
                // particle is going to the left, check if off-screen
                if (p.x - p.vx * this.params.particles.length + p.size < 0)
                    p.x = this.cnvw + p.size; // teleport to the right edge
            }

            this._drawParticle(p);
        }
    }
}
