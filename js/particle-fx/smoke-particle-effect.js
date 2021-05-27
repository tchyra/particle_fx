
Math.deg2rad = function (deg) {
    return deg / 180 * Math.PI;
}

Math.randomBell = function () {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm() // resample between 0 and 1
    return num;
}

class Vector {

    static fromAngleAndMag(a, mag) {
        return new Vector(Math.cos(a) * mag, Math.sin(a) * mag);
    }

    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    plus(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    minus(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    multiply(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    times(n) {
        return new Vector(this.x * n, this.y * n);
    }

    divide(n) {
        this.x /= n;
        this.y /= n;
        return this;
    }

    dividedBy(n) {
        return new Vector(this.x / n, this.y / n);
    }

    _sqr(n) { return n * n; }

    distSqr(v) {
        return this._sqr(this.x - v.x) + this._sqr(this.y - v.y);
    }

    dist(v) {
        return Math.sqrt(this.distSqr(v));
    }

    getMagSqr() {
        return this.x * this.x + this.y * this.y;
    }

    getMag() {
        return Math.sqrt(this.getMagSqr());
    }

    normalize() {
        return this.divide(this.getMag());
    }

    normalized() {
        return this.dividedBy(this.getMag());
    }

    dirTo(v) {
        return v.minus(this).normalize();
    }

    clone() {
        return new Vector(this.x, this.y);
    }

}

class SmokeParticle {
    constructor(pos, vel, drag, color, lifespan) {
        this.pos = pos;
        this.vel = vel;
        this.drag = drag;
        this.baseColor = color;
        this.lifespan = lifespan;
        this.remaining = lifespan;
    }

    update(deltaTimeS) {
        this.pos.add(this.vel.times(deltaTimeS));

        this.remaining -= deltaTimeS;
        this.alpha = this.remaining / this.lifespan;
    }

    draw(ctx, size) {
        ctx.fillStyle = `rgba(${this.baseColor.r},${this.baseColor.g},${this.baseColor.b},${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, size, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

class Timer {

    constructor(interval, callback) {
        this.interval = interval;
        this.remaining = interval;
        this.callback = callback;
    }

    update(deltaTimeS) {

        this.remaining -= deltaTimeS;

        if (this.remaining <= 0) {

            this.callback(this);
            this.remaining = this.interval;

        }

    }
}

class LerpTimer extends Timer {
    constructor(interval, callback, from, to) {
        super(interval, callback);
        this.range = new Range(from, to);
    }

    getCurrent() {
        return this.range.lerp(1 - this.remaining / this.interval);
    }

    update(deltaTimeS) {
        super.update(deltaTimeS);
        return this.getCurrent();
    }

    next(interval, value) {
        this.range.min = this.range.max;
        this.range.max = value;
        this.interval = interval;
    }
}

class WindRay {
    constructor(startY, speed, r, yRange, maxSpeed, rRange, maxYDevPerPhase, maxSpeedDevPerPhase, maxRDevPerPhase, phaseDurRange) {
        this.y = startY;
        this.speed = speed;
        this.r = r;
        this.yRange = yRange;
        this.rRange = rRange;
        this.maxSpeed = maxSpeed;
        this.maxYDevPerPhase = maxYDevPerPhase;
        this.maxSpeedDevPerPhase = maxSpeedDevPerPhase;
        this.maxRDevPerPhase = maxRDevPerPhase;
        this.phaseDurRange = phaseDurRange;

        this.yPhaseTimer = new LerpTimer(phaseDurRange.roll(),
            timer => timer.next(this.phaseDurRange.roll(), this.getNewYVal()),
            this.y, this.getNewYVal()
        );

        this.speedPhaseTimer = new LerpTimer(phaseDurRange.roll(),
            timer => timer.next(this.phaseDurRange.roll(), this.getNewSpeedVal()),
            this.speed, this.getNewSpeedVal()
        );

        this.rPhaseTimer = new LerpTimer(phaseDurRange.roll(),
            timer => timer.next(this.phaseDurRange.roll(), this.getNewRVal()),
            this.r, this.getNewRVal()
        );
    }

    affect(p, deltaTimeS) {
        let dist = Math.abs(this.y - p.pos.y);
        if (dist <= this.r) {
            p.vel.add(new Vector((dist / this.r) * this.speed * p.drag * deltaTimeS, 0));
        }
    }

    update(deltaTimeS) {
        this.y = this.yPhaseTimer.update(deltaTimeS);
        this.speed = this.speedPhaseTimer.update(deltaTimeS);
        this.r = this.rPhaseTimer.update(deltaTimeS);
    }

    getNewYVal() {
        return this.yRange.clamp(this.y + Range.roll(-this.maxYDevPerPhase, this.maxYDevPerPhase));
    }

    getNewSpeedVal() {
        return Range.clamp(-this.maxSpeed, this.maxSpeed, this.speed + Range.roll(-this.maxSpeedDevPerPhase, this.maxSpeedDevPerPhase));
    }

    getNewRVal() {
        return this.rRange.clamp(this.r + Range.roll(-this.maxRDevPerPhase, this.maxRDevPerPhase));
    }


    debugDraw(ctx, x, width) {
        ctx.fillStyle = Math.sign(this.speed) < 0 ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)';
        ctx.fillRect(x, this.y - this.r, width, this.r * 2);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(x, this.y);
        ctx.lineTo(x + width, this.y);
        ctx.stroke();
    }
}

class SmokeParticleEffect extends ParticleEnv {

    static getDefaultSimulationParams() {
        return {
            particles: {
                size: 4,
                dragRange: new Range(0.65, 1),
                lifespan: 7,
                color: Color.fromHex('#fff')
            },
            startVel: {
                magRange: new Range(200, 300),
                magMaxChange: 12,
                magDevPerSpawn: 100,
                angleRange: new Range(-15, 15),
                angleMaxChange: 10,
                angleDevPerSpawn: 10
            },
            spawn: {
                interval: 0.25,
                particleCount: 6,
                maxDisplacement: 10
            },
            connections: {
                cutoffDist: 100,
                color: Color.fromHex('#fff'),
                width: 2,
            },
            margin: {
                top: 40,
                left: 40,
                right: 40,
                bottom: 80,
                useSideKillzone: false,
            },
            wind: {
                rayCount: 6,
                maxSpeed: 200,
                maxYDev: 200,
                rayRRange: new Range(40, 120),
                maxYDevPerPhase: 75,
                maxSpeedDevPerPhase: 75,
                maxRDevPerPhase: 20,
                phaseDurRange: new Range(0.5, 2),
                drawRays: false,
            }
        };
    }

    constructor(targetCnv, params) {
        super(targetCnv, params);
    }

    start() {
        this._updateSpawnPoint();
        this.particles = [];

        this.spawnAngle = this.params.startVel.angleRange.roll();
        this.spawnMag = this.params.startVel.magRange.roll();

        this.spawnTimer = new Timer(this.params.spawn.interval, () => this._spawn());
        this._createWindRays();

        this._spawn();
    }

    _updateSpawnPoint() {
        this.spawnPoint = new Vector(this.cnvw / 2, this.cnvh + this.params.margin.bottom);
    }

    _updateSpawnAngleAndMag() {
        this.spawnAngle = this.params.startVel.angleRange.clamp(this.spawnAngle + Range.roll(-this.params.startVel.angleMaxChange, this.params.startVel.angleMaxChange));
        this.spawnMag = this.params.startVel.magRange.clamp(this.spawnMag + Range.roll(-this.params.startVel.magMaxChange, this.params.startVel.magMaxChange));
    }

    _createWindRays() {

        this.windRays = [];

        let yStep = this.cnvh / (this.params.wind.rayCount + 2);
        let yRange = new Range(0, this.cnvh);

        for (var i = 0; i < this.params.wind.rayCount; i++) {

            let startY = yStep + yStep * i;

            this.windRays.push(new WindRay(
                startY,
                (i % 2 === 0 ? -1 : 1) * Range.roll(0, this.params.wind.maxSpeed),
                this.params.wind.rayRRange.roll(),
                new Range(startY - this.params.wind.maxYDev, startY + this.params.wind.maxYDev),
                this.params.wind.maxSpeed,
                this.params.wind.rayRRange,
                this.params.wind.maxYDevPerPhase,
                this.params.wind.maxSpeedDevPerPhase,
                this.params.wind.maxRDevPerPhase,
                this.params.wind.phaseDurRange
            ));

        }

    }

    _spawn() {

        for (var i = 0; i < this.params.spawn.particleCount; i++) {

            let angOffset = Range.rollBell(-this.params.startVel.angleDevPerSpawn, this.params.startVel.angleDevPerSpawn);
            let magOffset = Range.rollBell(-this.params.startVel.magDevPerSpawn, this.params.startVel.magDevPerSpawn);

            this.particles.push(new SmokeParticle(
                this.spawnPoint.plus(Vector.fromAngleAndMag(Range.roll(0, 2 * Math.PI), Range.rollBell(-this.params.spawn.maxDisplacement, this.params.spawn.maxDisplacement))),
                Vector.fromAngleAndMag(Math.deg2rad(this.spawnAngle - 90 + angOffset), this.spawnMag + magOffset),
                this.params.particles.dragRange.roll(),
                this.params.particles.color,
                this.params.particles.lifespan
            ));

        }

        this._updateSpawnAngleAndMag();
    }

    _tryDrawConnection(p1, p2) {

        let dist = p1.pos.dist(p2.pos);

        if (dist <= this.params.connections.cutoffDist) {

            let frac = Math.min(p1.alpha, p2.alpha, (1 - dist / this.params.connections.cutoffDist));

            this.ctx.lineWidth = this.params.connections.width;
            //this.ctx.lineCap = 'round';
            this.ctx.strokeStyle = `rgba(${this.params.connections.color.r},${this.params.connections.color.g},${this.params.connections.color.b},${frac})`;

            this.ctx.beginPath();
            this.ctx.moveTo(p1.pos.x, p1.pos.y);
            this.ctx.lineTo(p2.pos.x, p2.pos.y);
            this.ctx.stroke();

        }

    }

    frame(deltaTime, deltaTimeS, frameNo) {

        // skip the frame if more than 500ms elapsed since the last frame, the most likely cause of this is slowing animation framerate when the browser window is in the background.
        if (deltaTime > 500) return;
        this.ctx.clearRect(0, 0, this.cnvw, this.cnvh); // clear the canvas

        this.spawnTimer.update(deltaTimeS);

        for (let j = 0; j < this.windRays.length; j++) {

            this.windRays[j].update(deltaTimeS);

            if (this.params.wind.drawRays)
                this.windRays[j].debugDraw(this.ctx, 0, this.cnvw);
        }

        let p;

        for (let i = 0; i < this.particles.length; i++) {
            p = this.particles[i];

            p.update(deltaTimeS);

            for (let j = 0; j < this.windRays.length; j++) {

                this.windRays[j].affect(p, deltaTimeS);
            }

            if (p.remaining <= 0                                        // expired via lifespan
                || (p.pos.y < -this.params.margin.top)                  // went off the top of the screen
                || this.params.margin.useSideKillzone && (              // side killzones are active AND
                    p.pos.x < -this.params.margin.left                  // went off to the left
                    || p.pos.x > this.cnvw + this.params.margin.right)  // went off to the right
            ) {
                this.particles.splice(i, 1);
                i--;
            }
        }

        for (let i = 0; i < this.particles.length - 1; i++) {
            for (let j = 0; j < i; j++) {
                this._tryDrawConnection(this.particles[i], this.particles[j]);
            }
        }

        for (var i = 0; i < this.particles.length; i++) {
            p = this.particles[i];
            p.draw(this.ctx, this.params.particles.size, this.params.particles.alpha / 255);
        }
    }

    resize() {
        this.centerX = this.cnvw / 2;
        this.centerY = this.cnvh / 2;
        this._updateSpawnPoint();
    }

}
