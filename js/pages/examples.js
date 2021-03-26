
var effect, editor;

var els = {
    btnResetParams: {
        id: 'btn_reset_params',
        on_click: btnResetParams_click
    },
    btnFullscreen: {
        id: 'btn_fullscreen',
        on_click: btnFullscreen_click
    },
    sidebarContainer: '.sidebar-container',
    cnv: {
        id: 'cnv',
        on_click: cnv_click
    },
    topBar: '.top-bar'
}

var localStorageParamsKey;

document.addEventListener('DOMContentLoaded', () => {

    initEls(els);
    initTabs();
    document.addEventListener('keydown', document_keydown);

    localStorageParamsKey = effectType.name + '_params'

    // load params from local storage
    var startParams = EffectParamStorage.loadParamsFromLocalStorage(localStorageParamsKey, effectType.getDefaultSimulationParams())

    effect = new effectType('#cnv', startParams);
    editor = new ParamEditor('tab_params', effect);
    editor.onChange = () => {
        // save params to local storage after editor changes
        EffectParamStorage.saveParamsToLocalStorage(localStorageParamsKey, effect.params);
    }

});

function initTabs() {
    let tabs = document.querySelectorAll('.tabs > *');
    let tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tabEl => {

        let tabTarget = tabEl.getAttribute('data-target');

        tabEl.addEventListener('click', ev => {

            tabs.forEach(tab => {
                tab.classList.toggle('active', tab === tabEl);
            });

            tabContents.forEach(el => {
                el.classList.toggle('active', el.id === tabTarget);
            });
        });
    });
}

function btnResetParams_click(ev) {
    console.log('resetting the params');
    effect.params = effectType.getDefaultSimulationParams();
    effect.restart();
    localStorage.removeItem(localStorageParamsKey);
    editor.recreateAttachments();
}

function setFullscreenMode(enable) {

    if (enable) {
        els.sidebarContainer.classList.add('hidden');
        document.scrollingElement.style.overflow = 'hidden';
        els.topBar.classList.add('hidden');
    } else {
        els.sidebarContainer.classList.remove('hidden');
        document.scrollingElement.style.overflow = 'auto';
        els.topBar.classList.remove('hidden');
    }
}

function btnFullscreen_click(ev) {
    setFullscreenMode(true);
}

function cnv_click(ev) {
    setFullscreenMode(false);
}

function document_keydown(ev) {
    if (ev.keyCode === 27) {
        // escape key
        setFullscreenMode(false);
    }
}

