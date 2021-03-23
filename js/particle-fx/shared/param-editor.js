
class ParamEditorAttachment {

    static canCreateFor(obj) {
        return typeof obj === 'number'
            || (typeof Color !== 'undefined' && obj instanceof Color)
    }

    static getTypeFor(obj) {
        if (typeof obj === 'number')
            return 'number';
        else if (typeof Color !== 'undefined' && obj instanceof Color)
            return 'color';
        else
            return null;
    }

    constructor(parent, propName, input) {
        this.parent = parent;
        this.propName = propName;
        this.input = input;
        this.type = ParamEditorAttachment.getTypeFor(this.valueInEffect);

        this.input.addEventListener('change', () => {
            this.copyFromInputToEffect();
            if (typeof this.onCopiedToEffect === 'function')
                this.onCopiedToEffect();
        });

        this.copyFromEffectToInput();
    }

    _copy(toEffect) {
        if (this.type === 'number') {

            if (toEffect)
                this.valueInEffect = this.input.valueAsNumber;
            else
                this.input.valueAsNumber = this.valueInEffect;

        } else if (this.type === 'color') {

            if (toEffect) {

                // create colour from input to effect
                this.valueInEffect = Color.fromHex(this.input.value);

                if (typeof ColorRange !== 'undefined' && this.parent instanceof ColorRange) {
                    this.parent.refreshRGBRanges();
                }

            } else {
                this.input.value = this.valueInEffect.toHexString();
            }

        } else {
            if (toEffect)
                this.valueInEffect = this.input.value;
            else
                this.input.value = this.valueInEffect;
        }
    }

    copyFromInputToEffect() { this._copy(true); }
    copyFromEffectToInput() { this._copy(false); }

    get valueInEffect() {
        return this.parent[this.propName];
    }

    set valueInEffect(value) {
        this.parent[this.propName] = value;
    }
}

class ParamEditor {

    static getEl(elIdOrSelector) {

        if (elIdOrSelector instanceof Element)
            return elIdOrSelector;
        else
            return document.getElementById(elIdOrSelector) || document.querySelector(elIdOrSelector);
    }

    constructor(container, effect) {
        this.container = ParamEditor.getEl(container);

        if (!(effect instanceof ParticleEnv))
            throw new Error('effect must derive from ParticleEnv.');

        this.effect = effect;
        this._initAttachments();
    }

    _combinePath(path, paramName) {
        if (!path) return paramName
        else return path + '.' + paramName;
    }

    // creates attachments for effect params
    _initAttachments() {
        this.attachments = {};

        console.groupCollapsed('[EDITOR] init warnings');

        for (var childPropName in this.effect.params) {
            this._createAttachments('', this.effect.params, childPropName);
        }

        console.groupEnd();
    }

    _createAttachments(pathToParent, parent, propName) {

        let pathToProp = this._combinePath(pathToParent, propName);
        let obj = parent[propName];

        if (ParamEditorAttachment.canCreateFor(parent[propName])) {

            let input = this.container.querySelector(`[name="${pathToProp}"]`);
            if (input) {

                let attachment = this.attachments[pathToProp] = new ParamEditorAttachment(parent, propName, input);
                attachment.onCopiedToEffect = () => this.effect.restart();

            } else {
                console.warn(`[${pathToProp}]: no editor control found.`)
            }

        } else {
            for (var childPropName in obj) {
                this._createAttachments(pathToProp, obj, childPropName);
            }
        }

    }

    _handleInputChange(attachment) {
        attachment.copyFromInputToEffect();
        this.effect.restart();
    }

    // loads parameters from local storage using the given name
    load(name) {

    }

    // saves parameters to local storage using the given name
    save(name) {

    }
}
