
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

document.addEventListener('DOMContentLoaded', () => {

    effect = initEffect();

    initTabs();
    editor = new ParamEditor(effect);

    initEls(els);
    document.addEventListener('keydown', document_keydown);
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

function ParamEditor(effect) {

    var self = this;
    this.autoSave = true;

    // private functions

    function _concatPath(path, paramName) {
        if (!path) return paramName
        else return path + '.' + paramName;
    }

    function _initForParam(parent, path, paramName) {

        let paramVal = parent[paramName];

        if (typeof (paramVal) !== 'object' || (typeof Color === 'function' && paramVal instanceof Color)) {

            let paramPath = _concatPath(path, paramName);

            let input = document.querySelector('input[name="' + paramPath + '"]');

            if (input) {
                _initForInput(parent, path, paramName, paramVal, paramPath, input);
                console.log('OK [' + paramPath + '] =', paramVal);

            } else {
                console.warn('[' + paramPath + ']: no editor control found.')
            }

        } else {
            for (var childParamName in paramVal) {
                _initForParam(paramVal, _concatPath(path, paramName), childParamName);
            }
        }

    }

    function _initForInput(parent, path, paramName, paramVal, paramPath, input) {

        let attachment = self.attachments[paramPath] = {
            input,
            isInt: input.getAttribute('data-type') === 'int',
            startVal: paramVal,
            parent,
            paramName,
            modified: false
        };

        if (input.type === 'color') {
            input.value = paramVal.toHex();
        } else {
            input.value = paramVal;
        }

        input.addEventListener('change', ev => {

            if (input.type === 'number') {

                input.value = Math.max(input.min, Math.min(input.valueAsNumber, input.max))

                if (attachment.isInt) {
                    input.value = Math.floor(input.value);
                }

                attachment.modified = input.valueAsNumber !== attachment.startVal;

            } else if (input.type === 'color') {

                attachment.modified = input.value !== attachment.startVal.toHex();
            }


            if (self.autoSave) {
                if (attachment.modified) {
                    _saveAttachment(attachment);
                    effect.restart();
                }
            } else {
                input.classList.toggle('modified', attachment.modified);
            }
        });
    }

    function _saveAttachment(attachment) {
        if (attachment.input.type === 'color') {

            attachment.startVal = attachment.parent[attachment.paramName] = Color.fromHex(attachment.input.value);

            if (attachment.parent instanceof ColorRange)
                attachment.parent.refreshRGBRanges();

        } else {
            attachment.startVal = attachment.parent[attachment.paramName] = attachment.input.valueAsNumber;
        }
        attachment.modified = false;
        attachment.input.classList.remove('modified');
    }

    // public methods

    this.save = function () {
        let anyModified = false;

        for (let path in self.attachments) {
            let attachment = self.attachments[path];

            if (attachment.modified) {
                _saveAttachment(attachment);
                anyModified = true;
            }
        }

        if (anyModified) {
            effect.restart();
        }
    }

    // initialisation

    console.group('param editor init');

    this.effect = effect;
    this.attachments = {};

    this.editorParams = {};

    for (var paramName in effect.params) {
        _initForParam(effect.params, '', paramName);
    }

    console.groupEnd();
}

function btnResetParams_click(ev) {
    console.clear();
    effect = initEffect();
    editor = new ParamEditor(effect);
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

