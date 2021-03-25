
class ParamEditorAttachment {

    static canCreateForObject(obj) {
        return typeof Color === 'function' && obj instanceof Color;
    }

    // selects an attachment subclass for a given object
    static createAttachmentFor(parent, propName, input) {
        let obj = parent[propName];

        if (typeof obj === 'number')
            return new ParamEditorNumberAttachment(parent, propName, input);
        else if (typeof Color === 'function' && obj instanceof Color)
            return new ParamEditorColorAttachment(parent, propName, input);
        else
            throw new Error('Cannot create an attachment for ', obj);
    }

    constructor(parent, propName, input) {
        this.parent = parent;
        this.propName = propName;
        this.input = input;
    }

    get valueInEffect() {
        return this.parent[this.propName];
    }

    set valueInEffect(value) {
        this.parent[this.propName] = value;
    }

    // ABSTRACT METHODS

    copyFromInputToEffect() {
        throw new Error('Classes deriving from ParamEditorAttachment must implement copyFromInputToEffect().');
    }

    copyFromEffectToInput() {
        throw new Error('Classes deriving from ParamEditorAttachment must implement copyFromEffectToInput().');
    }
}

class ParamEditorNumberAttachment extends ParamEditorAttachment {

    constructor(parent, propName, input) {
        super(parent, propName, input);
    }

    copyFromEffectToInput() {
        this.input.valueAsNumber = this.valueInEffect;
    }

    copyFromInputToEffect() {
        this.valueInEffect = this.input.valueAsNumber;
    }
}

class ParamEditorColorAttachment extends ParamEditorAttachment {

    constructor(parent, propName, input) {
        super(parent, propName, input);
    }

    copyFromEffectToInput() {
        this.input.value = this.valueInEffect.toHexString();
    }

    copyFromInputToEffect() {
        // create colour from input to effect
        this.valueInEffect = Color.fromHex(this.input.value);

        if (typeof ColorRange !== 'undefined' && this.parent instanceof ColorRange) {
            this.parent.refreshRGBRanges();
        }
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
            throw new Error('Effect must derive from ParticleEnv.');

        this.effect = effect;
        this._initAttachments();
    }

    _combinePath(path, paramName) {
        if (!path) return paramName
        else return path + '.' + paramName;
    }

    // creates attachments for effect params
    _initAttachments() {
        this.attachments = [];

        console.groupCollapsed('[ParamEditor] init log');

        for (var childPropName in this.effect.params) {
            this._createAttachments('', this.effect.params, childPropName);
        }

        console.groupEnd();
    }

    _createAttachments(pathToParent, parent, propName) {

        let pathToProp = this._combinePath(pathToParent, propName);
        let obj = parent[propName];

        if (typeof obj !== 'object' || ParamEditorAttachment.canCreateForObject(obj)) {

            let input = this.container.querySelector(`[name="${pathToProp}"]`);
            if (input) {

                try {
                    let attachment
                        = this.attachments[pathToProp]
                        = ParamEditorAttachment.createAttachmentFor(parent, propName, input);

                    attachment.copyFromEffectToInput();

                    input.addEventListener('change', () => {
                        attachment.copyFromInputToEffect();
                        this.effect.restart();

                        if (typeof this.onChange === 'function')
                            this.onChange();
                    });

                    // log success to console
                    console.log(`[${pathToProp}]: ${attachment.constructor.name}`);

                } catch (e) {
                    console.error(`[${pathToProp}]: ${e}`);
                }

            } else {
                console.warn(`[${pathToProp}]: no editor control found.`)
            }

        } else {
            for (var childPropName in obj) {
                this._createAttachments(pathToProp, obj, childPropName);
            }
        }

    }

    recreateAttachments() {
        this._initAttachments();
    }
}
