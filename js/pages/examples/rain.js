
var effect;

document.addEventListener('DOMContentLoaded', () => {

    effect = new RainParticleEffect('#cnv', {
        wind: {
            printStateChanges: false
        }
    });
});
