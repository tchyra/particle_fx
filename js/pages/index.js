
// I know sometimes using arrow functions and sometimes the normal syntax is messy
// but Visual Studio collapses the normal syntax on Ctrl+M, Ctrl+O and it does not collapse arrow functions
// so that's why it's the way it is

let els = {
    toc: '.toc',
    sidebar: {
        selector: '.page-sidebar',
        on_click: toggleSidebar
    },
    sidebarSection: {
        selector: '.page-sidebar > section',
        on_click: blockEvent
    },
    btnMenu: {
        id: 'btn_menu',
        on_click: toggleSidebar
    },
    btnDrawerCloseButton: {
        selector: '.drawer-close-button',
        on_click: toggleSidebar
    },
    topBar: '.top-bar'
};


document.addEventListener('DOMContentLoaded', () => {
    initEls(els);
    initTOC();
    initExampleFx();
    initDrawer();

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

            // absolutely no idea why it does not work without the timeout
            setTimeout(() => els.sidebar.classList.remove('in'), 0);

            let liTargetBCR = liTargetSection.getBoundingClientRect();
            let top = document.scrollingElement.scrollTop + liTargetBCR.top - scrollToSpacingTop;
            
            document.scrollingElement.scrollTo({ top, behavior: 'smooth' });
        });

    });

}

function initExampleFx() {

    let snowEffect = new SnowParticleEffect('#cnv_snow', {
        particles: {
            count: 8,
            sizeRange: new Range(2, 4),
            vyRange: new Range(69, 420)
        },
        wind: {
            vxRange: new Range(50, 320)
        }
    });

    let rainEffect = new RainParticleEffect('#cnv_rain', {
        particles: {
            count: 12,
            sizeRange: new Range(1, 2),
            length: 0.07,
            vyRange: new Range(600, 1000),
        },
        wind: {
            vxRange: new Range(1920 / 10, 1920 / 5)
        }
    });

    let volcanoEffect = new VolcanoParticleEffect('#cnv_volcano', {
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

function initDrawer() {
    
}

function toggleSidebar(ev) {
    els.sidebar.classList.toggle('in');
    ev.stopPropagation();
    return true;
}

function blockEvent(ev) {
    ev.stopPropagation();
    return true;
}