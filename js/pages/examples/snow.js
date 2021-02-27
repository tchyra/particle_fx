
var fx;

document.addEventListener('DOMContentLoaded', () => {
    var params = SnowParticleEffect.getDefaultSimulationParams();
    params.wind.printStateChanges = false;
    fx = new SnowParticleEffect('#cnv', params);
});
