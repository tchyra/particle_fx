﻿
var effect;

document.addEventListener('DOMContentLoaded', () => {

    effect = new SnowParticleEffect('#cnv', {
        particles: {
            count: 100
        },
        wind: {
            printStateChanges: false
        }
    });
});
