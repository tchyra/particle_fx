
class VolcanoParticleEffect extends ParticleEnv {

    static getDefaultSimulationParams() {
        // velocity is in px/s
        return {
            particles: {
                maxCount: 200,
                massRange: new Range(2, 8),
                sizeRange: new Range(2, 8),
                dragRange: new Range(0.5, 1),

                launchVxRange: new Range(-200, 200),
                launchVyRange: new Range(300, 500),

                startColorRange: new ColorRange('#FCC00C', '#F45313'),
                endColorRange: new ColorRange('#280404', '#99150c'),
                cooldownDurRange: new Range(0.5, 4)
            },
            gravityForce: 100,
            airDecel: 0.5,
            spXFraction: 0.5,
            spYFraction: 0.5,
            spawnwaveDelayRange: new Range(0.1, 1),
            spawnCountRange: new Range(20, 31)
        };
    }

    constructor(targetCnv, params) {
        super(targetCnv, params);
    }

    _createParticle() {
        const pp = this.params.particles;

        const p = {
            x: this.spX,
            y: this.spY,
            vx: pp.launchVxRange.roll(),
            vy: -pp.launchVyRange.roll(),
            mass: pp.massRange.roll(),
            colorRange: new ColorRange(pp.startColorRange.roll(), pp.endColorRange.roll()),
            lifeDur: 0,
            cooldownDurRange: new Range(0, pp.cooldownDurRange.roll())
        };

        let massFraction = pp.massRange.getFraction(p.mass);
        p.size = pp.sizeRange.lerp(massFraction);
        p.drag = pp.dragRange.lerp(massFraction);

        p.color = p.startColor;

        return p;
    }

    _deleteParticle(i) {
        this.particles.splice(i, 1);
        this.particleCount--;
    }

    _spawnwave() {
        let freeSlots = this.params.particles.maxCount - this.particleCount;
        let spawnCount = Math.min(this.params.spawnCountRange.rollInt(), freeSlots);

        if (spawnCount > 0) {
            for (var i = 0; i < spawnCount; i++) {
                this.particles[this.particleCount] = this._createParticle();
                this.particleCount++;
            }
        }

        this.spawnwaveRemaining = this.params.spawnwaveDelayRange.roll();
    }

    _drawParticle(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }

    start() {
        this.particles = new Array(this.params.particles.maxCount);
        this.particleCount = 0;

        this.spX = this.cnvw * this.params.spXFraction;
        this.spY = this.cnvh * this.params.spYFraction;

        this._spawnwave();
    }

    frame(deltaTime, deltaTimeS, frameNo) {

        // skip the frame if more than 500ms elapsed since the last frame, the most likely cause of this is slowing animation framerate when the browser window is in the background.
        if (deltaTime > 500) return;

        // clear the canvas
        this.ctx.clearRect(0, 0, this.cnvw, this.cnvh);

        this.spawnwaveRemaining -= deltaTimeS;

        if (this.spawnwaveRemaining <= 0) {
            this._spawnwave();
        }

        let p;
        for (var i = 0; i < this.particleCount; i++) {
            p = this.particles[i];

            p.vx -= this.params.airDecel * p.vx * p.drag * deltaTimeS;
            p.vy += this.params.gravityForce * p.mass * deltaTimeS;

            p.x += p.vx * deltaTimeS;
            p.y += p.vy * deltaTimeS;


            if (this.params.gravityForce > 0) {
                // particle is falling down
                if (p.y - p.size > this.cnvh) {
                    this._deleteParticle(i);
                    i--;
                }
            } else {
                // particle is falling up
                if (p.y + p.size < 0) {
                    this._deleteParticle(i);
                    i--;
                }
            }

            p.lifeDur += deltaTimeS;

            let cooldownFraction = Math.min(p.cooldownDurRange.getFraction(p.lifeDur), 1);
            p.color = p.colorRange.lerp(cooldownFraction);

            this._drawParticle(p);
        }
    }

    resize() {
        if (this.params) {
            this.spX = this.cnvw * this.params.spXFraction;
            this.spY = this.cnvh * this.params.spYFraction;
        }
    }
}
