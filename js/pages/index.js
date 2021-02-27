
// I know sometimes using arrow functions and sometimes the normal syntax is messy
// but Visual Studio collapses the normal syntax on Ctrl+M, Ctrl+O and it does not collapse arrow functions
// so that's why it's the way it is

let els = {
    toc: '.toc'
};


document.addEventListener('DOMContentLoaded', () => {
    initEls(els);
    initTOC();
    initExampleFx();

    document.getElementById('current_year').innerText = new Date().getFullYear();
});

function initTOC() {

    //
    // ON-CLICK SCROLLING
    //

    // spacing in px to substract from scroll target bounding box top
    const scrollToSpacingTop = 64;

    // find all li children with the [data-target] attribute declared
    let tocEntries = els.toc.querySelectorAll('li[data-target]');

    tocEntries.forEach(li => {

        let liTargetName = li.getAttribute('data-target');
        let liTargetSection = document.querySelector(`section[data-name="${liTargetName}"]`);

        li.addEventListener('click', function (ev) {

            let liTargetBCR = liTargetSection.getBoundingClientRect();
            let top = document.scrollingElement.scrollTop + liTargetBCR.top - scrollToSpacingTop;

            document.scrollingElement.scrollTo({ top, behavior: 'smooth' });
        });

    });

}

function initExampleFx() {

    let snowFx = new SnowParticleEffect('#cnv_snow', {
        particles: {
            count: 8,
            sizeRange: new Range(2, 4),
            vyRange: new Range(69, 420)
        },
        wind: {
            vxRange: new Range(50, 320),
            printStateChanges: false
        }
    });

    let rainfx = new RainParticleEffect('#cnv_rain', {
        particles: {
            count: 12,
            sizeRange: new Range(1, 2),
            length: 0.1,
            vyRange: new Range(600, 1000),
        },
        wind: {
            printStateChanges: false
        }
    });

    let volcanoFx = new VolcanoParticleEffect('#cnv_volcano', {
        particles: {
            maxCount: 20,
            sizeRange: new Range(3, 5),
            launchVyRange: new Range(200, 280),
            launchVxRange: new Range(-50, 50)
        },
        gravityForce: 80,
        spYFraction: 0.9
    });
}
