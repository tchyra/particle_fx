
class WindParticleEffect extends ParticleEnv {

    static getDefaultSimulationParams() {
        return {
            particles: {
                width: 20,
                spacing: 400,
                color: Color.fromHex('#222222')
            },
            wind: {
                vxRange: new Range(1920 / 10, 1920 / 1),
                holdDurRange: new Range(2, 4),
                transitionDurRange: new Range(1, 4),
                printStateChanges: false
            },
            chart: {
                fontSize: 16,
                fontFamily: 'Consolas, monospace',
                transitionColor: Color.fromHex('#f79618'),
                holdColor: Color.fromHex('#5ff718'),
                boundsWidth: 1,
                span: 200,
                pointRadius: 4,
                lineColor: Color.fromHex('#5ff718'),
                lineWidth: 2,
                scrollSpeed: 100 // px/s
            }
        };
    }

    constructor(targetCnv, params) {
        super(targetCnv, params);
    }

    start() {

        this._createParticles();
        this._calcChartBounds();

        this.wind = new WindSystem(this.params.wind);

        // start the wind system
        this.wind.start();
        this.prevFrameWindState = this.wind.state === 'h' ? 't' : 'h';

        this.chartPoints = [{
            x: this.cnvw / 2,
            y: this._calcCurrentWindY(),
            color: this._getColorForWindState(this.prevFrameWindState)
        }];

        this.currentChartPoint = {
            x: this.cnvw / 2,
            y: this._calcCurrentWindY(),
            color: this._getColorForWindState(this.wind.state)
        };

        this.chartPoints.push(this.currentChartPoint);
    }

    _getColorForWindState(state) {
        return state === 'h' ? this.params.chart.holdColor : this.params.chart.transitionColor
    }

    _getDescriptionForWindState(state) {
        return state === 'h' ? 'HOLD' : 'TRNS';
    }

    _createParticles() {
        let particleCount = Math.ceil(this.cnvw / (this.params.particles.width + this.params.particles.spacing)) + 1;
        this.totalWidth = particleCount * (this.params.particles.width + this.params.particles.spacing)
        this.particles = new Array(particleCount);

        // create particles
        let x = 0;
        for (var i = 0; i < particleCount; i++) {
            this.particles[i] = { x };
            x += this.params.particles.width + this.params.particles.spacing;
        }
    }

    _calcChartBounds() {
        this.chartTopY = (this.cnvh - this.params.chart.span) / 2;
        this.chartBotY = (this.cnvh + this.params.chart.span) / 2;
        this.chartBounds = new Range(this.chartBotY, this.chartTopY);
    }

    _calcCurrentWindY() {
        return this.chartBounds.lerp(this.params.wind.vxRange.getFraction(this.wind.currentVx));
    }

    _drawFullWidthLine(y1, y2) {
        this.ctx.beginPath()
        this.ctx.moveTo(0, y1);
        this.ctx.lineTo(this.cnvw, typeof y2 === 'undefined' ? y1 : y2);
        this.ctx.stroke();
    }

    _drawChartLine(p1, p2) {
        this.ctx.strokeStyle = p2.color;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
    }

    _drawChartPoint(p) {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, this.params.chart.pointRadius, 0, 2 * Math.PI, false);
        this.ctx.fill();
    }

    frame(deltaTime, deltaTimeS, frameNo) {

        // skip the frame if more than 500ms elapsed since the last frame, the most likely cause of this is slowing animation framerate when the browser window is in the background.
        if (deltaTime > 500) return;

        this.ctx.clearRect(0, 0, this.cnvw, this.cnvh); // clear the canvas

        // update the wind system
        this.wind.frame(deltaTime, deltaTimeS, frameNo);

        // update and draw particles
        this.particlesFrame(deltaTime, deltaTimeS, frameNo);

        let currentWindY = this._calcCurrentWindY();
        let currentWindStateCol = this._getColorForWindState(this.wind.state);
        let offsetPointsBy = this.params.chart.scrollSpeed * deltaTimeS;

        // draw chart bounds
        this.ctx.lineWidth = this.params.chart.boundsWidth;

        this._drawFullWidthLine(this.chartTopY);
        this._drawFullWidthLine(this.chartBotY);

        // draw chart lines and points

        this.currentChartPoint.y = currentWindY;

        if (this.wind.state !== this.prevFrameWindState) {
            this.currentChartPoint = {
                x: this.cnvw / 2,
                y: currentWindY,
                color: currentWindStateCol
            };
            this.chartPoints.push(this.currentChartPoint);
            this.prevFrameWindState = this.wind.state;
        }

        this.ctx.lineWidth = this.params.chart.lineWidth;

        for (var i = 0; i < this.chartPoints.length; i++) {

            let point = this.chartPoints[i];

            if (i + 1 < this.chartPoints.length) {
                point.x -= offsetPointsBy;

                if (i === 1 && point.x + this.params.chart.pointRadius < 0) {
                    // if the 2nd point has gone offscreen, delete the first point and pretend this iteration never happened
                    this.chartPoints.splice(0, 1);
                    i--;
                    continue;
                }

                let nextPoint = this.chartPoints[i + 1];
                this._drawChartLine(point, nextPoint);
            }

            this._drawChartPoint(point);
        }

        this.ctx.fillStyle = currentWindStateCol;
        this._drawChartPoint(this.cnvw / 2, currentWindY);

        // draw text next to point
        this.ctx.font = this.params.chart.fontSize + 'px ' + this.params.chart.fontFamily;
        this.ctx.fillStyle = currentWindStateCol;
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.wind.currentVx.toFixed(2).padStart(7, ' '), this.cnvw / 2 + 10, currentWindY);

        // draw current phase above chart bounds
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.fillText(this.wind.state === 'h' ? 'HOLD PHASE' : 'TRANSITION PHASE', this.cnvw / 2, this.chartTopY - 10);

        // draw remaining time below chart bounds
        this.ctx.fillStyle = this.wind.state === 'h' ? this.params.chart.transitionColor : this.params.chart.holdColor;
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`${this.wind.state === 'h' ? 'TRNS' : 'HOLD'} in: ${this.wind.remaining.toFixed(2)}`, this.cnvw / 2, this.chartBotY + 10);
    }

    particlesFrame(deltaTime, deltaTimeS, frameNo) {
        let p;
        for (var i = 0; i < this.particles.length; i++) {

            p = this.particles[i];

            // particle vx is a function of wind vx
            p.x += this.wind.currentVx * deltaTimeS;

            if (this.wind.currentVx > 0) {
                // particle is going to the right, check if off-screen
                if (p.x > this.cnvw)
                    p.x -= this.totalWidth;// teleport to the left edge

            } else if (this.wind.currentVx < 0) {
                // particle is going to the left, check if off-screen
                if (p.x + p.size < 0)
                    p.x += this.totalWidth; // teleport to the right edge
            }

            this._drawParticle(p);
        }
    }

    _drawParticle(p) {
        this.ctx.fillStyle = this.params.particles.color;
        this.ctx.fillRect(
            p.x,
            (this.cnvh - this.params.chart.span) / 2,
            this.params.particles.width,
            this.params.chart.span
        );
    }

    resize() {
        this._createParticles();
        this._calcChartBounds();
    }
}
