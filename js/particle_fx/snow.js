
var env;

document.addEventListener('DOMContentLoaded', () => {
    env = new ParticleEnv('#cnv', particleInit, particleFrame);
});

// particle class definition
class SnowParticle {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.size = 0;
        this.color = '#fff';
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
}

// helper functions
function randBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function getGreyRGBString(greyVal) {
    return `rgb(${[greyVal, greyVal, greyVal].join(',')})`
}

// property range
class Range {
    constructor(min, max) {
        this.min = min; this.max = max;
    }

    roll() {
        return randBetween(this.min, this.max);
    }

    get span() {
        return this.max - this.min;
    }
}

// simulation properties

// particles

var particleCount = 50;

var particleSizeRange = new Range(2, 8);
var particleBrightnessRange = new Range(255 / 5, 255);

// velocity is in px/s
var particleVyRange = new Range(1080 / 6, 1080 / 1.5);

var particleWindFactorRange = new Range(0.3, 1);

// wind
var windVxRange = new Range(1920 / 5, 1920 / 10);
var windHoldDurRange = new Range(0.5, 2);
var windTransitionDurRange = new Range(1, 4);

var particles = new Array(particleCount);
var windPrevVx, windCurrentVx, windNextVx, windTransitionDur, windHoldDur;
var windRemaining, windState;

const windStates = {
    transition: 0,
    hold: 1
}

function particleInit(cnv, ctx, cnvw, cnvh) {

    // create particles
    for (var i = 0; i < particleCount; i++) {
        particles[i] = generateParticle(cnvw, cnvh);
    }

    rollWind();
    windPrevVx = 0;
}

function generateParticle(cnvw, cnvh) {

    let p = new SnowParticle();
    p.x = Math.random() * cnvw;
    p.y = Math.random() * cnvh;
    p.size = particleSizeRange.roll();
    p.color = getGreyRGBString(particleBrightnessRange.roll());

    p.vy = (particleVyRange.max - (p.size - particleSizeRange.min) / particleSizeRange.span * particleVyRange.span) + particleVyRange.min;

    return p;
}

function rollWind() {
    windPrevVx = windNextVx;
    windNextVx = windVxRange.roll();
    windTransitionDur = windTransitionDurRange.roll();
    windHoldDur = windHoldDurRange.roll();
    windRemaining = windTransitionDur;
    windState = windStates.transition;
}

function particleFrame(cnv, ctx, deltaTime, deltaTimeS, frameNo, cnvw, cnvh) {

    // skip frame if more than 500ms elapsed since the last frame
    // the most likely cause of this is slowing animation framerate
    // when the browser window is in the background
    if (deltaTime > 500) return;

    ctx.clearRect(0, 0, cnvw, cnvh);

    // decrease remaining by deltaTime in seconds
    windRemaining -= deltaTimeS;

    // timer ran out
    if (windRemaining <= 0) {

        function toFixedFloat(f, n) {
            return parseFloat(f.toFixed(n))
        }

        if (windState == windStates.transition) {
            // transition ended, time to hold
            windState = windStates.hold;
            windPrevVx = windCurrentVx = windNextVx;
            windRemaining = windHoldDur;
            console.log('[WIND] hold', toFixedFloat(windCurrentVx, 2), windHoldDur.toFixed(2) + 's');
        } else {
            // hold ended, time to reroll and transition
            rollWind();
            console.log('[WIND] trns', toFixedFloat(windPrevVx, 2), ' => ', toFixedFloat(windNextVx, 2), windTransitionDur.toFixed(2) + 's');
        }
    } else if (windState == windStates.transition) {
        // windPrevVx    -> windNextVx
        // windRemaining -> 0
        // invert windRemaining so it goes from 0 -> windTransitionDur
        windCurrentVx = (windNextVx - windPrevVx) * (windTransitionDur - windRemaining) / windTransitionDur + windPrevVx;
    }

    let p;
    for (var i = 0; i < particleCount; i++) {

        p = particles[i];

        // each particle has a vy
        p.y += p.vy * deltaTimeS;

        // particle vx is a function of wind vx and particle size
        p.vx = windCurrentVx * ((p.size - particleSizeRange.min) / particleSizeRange.span * particleWindFactorRange.max + particleWindFactorRange.min);

        // particle vx is a function of wind vx
        p.x += p.vx * deltaTimeS;

        if (p.vy > 0) {
            // particle is falling down, check if below screen
            if (p.y - p.size > cnvh) {
                p.y = -p.size; // teleport to top of screen
            }
        }
        else if (p.vy < 0) {
            // particle is falling up, check if above screen
            if (p.y + p.size < cnvh)
                p.y = cnvh + p.size; // teleport to bottom of screen
        }

        if (p.vx > 0) {

            // particle is going to the right, check if off-screen
            if (p.x - p.size > cnvw)
                p.x = -p.size; // teleport to the left edge

        } else if (p.vx < 0) {

            // particle is going to the left, check if off-screen
            if (p.x + p.size < 0)
                p.x = cnvw + p.size; // teleport to the right edge

        }

        p.draw(ctx);
    }

}