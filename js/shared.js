﻿
document.addEventListener('DOMContentLoaded', () => {

    initHideTopBarOnScroll();

});

function initEls(els) {

    for (var elVarName in els) {
        let elInit = els[elVarName];

        if (typeof elInit === 'string') {
            // btnSample: '#btn_sample'
            els[elVarName] = document.querySelector(elInit);
        } else if (typeof elInit === 'object') {
            for (var elInitPropName in elInit) {

                let elInitPropVal = elInit[elInitPropName];

                if (elInitPropName === 'id')
                    // get by ID
                    els[elVarName] = document.getElementById(elInitPropVal);

                else if (elInitPropName === 'selector')
                    // get by selector
                    els[elVarName] = document.querySelector(elInitPropVal);

                else if (elInitPropName.startsWith('on_')) {

                    if (!(els[elVarName] instanceof Element)) {
                        throw 'provide an id or selector before declaring event handlers.';
                    }

                    let eventName = elInitPropName.substr(3);
                    els[elVarName].addEventListener(eventName, elInitPropVal);
                }
            }
        }


    }

}

function initHideTopBarOnScroll() {
    let prevScrollTop = document.scrollingElement.scrollTop;
    let hidden = false;
    let topBar = document.querySelector('.top-bar');

    window.addEventListener('scroll', ev => {

        let newHidden = prevScrollTop < document.scrollingElement.scrollTop;

        if (newHidden !== hidden) {
            topBar.classList.toggle('hidden', newHidden);
            hidden = newHidden;
        }

        prevScrollTop = document.scrollingElement.scrollTop;
    });
}