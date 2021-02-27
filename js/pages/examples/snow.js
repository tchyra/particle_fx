
var effect;

document.addEventListener('DOMContentLoaded', () => {

    effect = new SnowParticleEffect('#cnv', {
        particles: {
            count: 50
        },
        wind: {
            printStateChanges: false
        }
    });
});
