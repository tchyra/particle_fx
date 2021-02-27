
document.addEventListener('DOMContentLoaded', () => {



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
                    els[elVarName] = document.getElementById(elInit);

                else if (elInitPropName === 'selector')
                    // get by selector
                    els[elVarName] = document.querySelector(elInit);

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