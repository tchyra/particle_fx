﻿
class AudioWavesParticle {

    constructor(size, color) {
        this.offsetY = 0;
        this.size = size;
        this.mass = 1;
        this.vy = 0;
        this.forceY = 0;
        this.velY = 0;
        this.color = color;
    }

    addForce(y) {
        this.forceY += y;
    }

    addElasticForces(k, damping) {
        // force generated by the spring
        this.addForce(-this.offsetY * k);
        // damping force (proportional to velocity)
        this.addForce(-this.velY * damping);
    }

    updatePhysics(deltaTimeS) {
        this.velY += this.forceY * this.mass * deltaTimeS;
        this.offsetY += this.velY * deltaTimeS;
        this.forceY = 0;
    }

    draw(ctx, x, baseY) {

        ctx.fillStyle = this.color;
        //ctx.fillRect(x - this.size / 2, (baseY + this.offsetY) - this.size / 2, this.size, this.size);
        ctx.beginPath();
        ctx.arc(x, baseY + this.offsetY, this.size, 0, 2 * Math.PI, false);
        ctx.fill();

        return { x, y: baseY + this.offsetY };
    }

}

class WavesParticleEffect extends ParticleEnv {

    static getDefaultSimulationParams() {
        return {
            particles: {
                count: 16,
                size: 5,
                spacing: 50,
                colorRange: new ColorRange('#3adbff', '#0032a0'),
                countPerRing: 20,
                ringScaleY: 0.25,
                colorOffsetYRange: new Range(-50, 50)
            },
            returnSpring: {
                k: 40,
                damping: 3
            },
            neighborSpring: {
                k: 40,
                damping: 2
            }
        };
    }

    constructor(targetCnv, params) {
        super(targetCnv, params);
        this._dragging = false;
    }

    createCanvasEventHandlers() {
        this.cnv.addEventListener('mousedown', ev => this.onMouseDown(ev));
        window.addEventListener('mousemove', ev => this.onMouseMove(ev));
        window.addEventListener('mouseup', ev => this.onMouseUp(ev));
    }

    start() {

        this.particles = new Array(this.params.particles.count);

        let angleRange = new Range(0, Math.PI * 2);
        this.ringAngleOffsets = new Array(this.params.particles.countPerRing);

        // create particles
        for (var i = 0; i < this.params.particles.count; i++) {

            this.particles[i] = new AudioWavesParticle(this.params.particles.size, this.params.particles.colorRange.roll());

            this.ringAngleOffsets[i] = 2;
            //this.ringAngleOffsets[i] = angleRange.roll();
        }
    }

    frame(deltaTime, deltaTimeS, frameNo) {

        // skip the frame if more than 500ms elapsed since the last frame, the most likely cause of this is slowing animation framerate when the browser window is in the background.
        if (deltaTime > 500) return;

        this.ctx.clearRect(0, 0, this.cnvw, this.cnvh); // clear the canvas

        let p;
        for (var i = 0; i < this.particles.length; i++) {

            p = this.particles[i];

            if (!this._dragging || i > 0) {
                p.addElasticForces(this.params.returnSpring.k, this.params.returnSpring.damping);
            }

            if (i > 0) {
                let deltaY = p.offsetY - this.particles[i - 1].offsetY;
                // force generated by the spring
                p.addForce(-deltaY * this.params.neighborSpring.k);
                p.addForce(-p.velY * this.params.neighborSpring.damping);
            }

            p.updatePhysics(deltaTimeS);

            p.color = this.params.particles.colorRange.lerp(this.params.particles.colorOffsetYRange.getFraction(p.offsetY));
        }

        for (var i = this.particles.length - 1; i >= 0; i--) {

            p = this.particles[i];

            if (i === 0) {
                p.draw(this.ctx, this.centerX, this.centerY);
            } else {

                let distFromCenter = i * this.params.particles.spacing;

                let angleCount = this.params.particles.countPerRing;
                let angleStep = Math.PI * 2 / angleCount;
                //let angle = this.ringAngleOffsets[i];
                let angle = angleStep / 2;

                let firstDrawAt = null;
                let prevDrawAt = null;

                for (var j = 0; j < angleCount; j++) {
                    let drawAt = p.draw(this.ctx,
                        this.centerX + Math.sin(angle) * distFromCenter,
                        this.centerY + Math.cos(angle) * distFromCenter * this.params.particles.ringScaleY
                    );

                    if (j == 0) firstDrawAt = drawAt;

                    if (prevDrawAt !== null) {

                        this.drawLine(p.color, prevDrawAt, drawAt);

                        if (j === angleCount - 1)
                            this.drawLine(p.color, drawAt, firstDrawAt);
                    }

                    prevDrawAt = drawAt;

                    angle += angleStep;
                }

            }

        }
    }

    drawLine(color, p1, p2) {

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
    }

    resize() {
        this.centerX = this.cnvw / 2;
        this.centerY = this.cnvh / 2;
    }

    restart() {
        super.restart();
    }

    onMouseDown(ev) {
        this._dragging = true;
        this._dragStartY = ev.clientY;
    }

    onMouseMove(ev) {
        if (this._dragging) {
            let delta = ev.clientY - this._dragStartY;
            this.particles[0].offsetY = delta;
        }
    }

    onMouseUp(ev) {
        this._dragging = false;
    }
}
