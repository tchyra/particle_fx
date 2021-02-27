
// initializes a particle enviroment around a given canvas and with given functions
class ParticleEnv {

    static getEl(elOrSelector) {

        if (typeof elOrSelector === 'string')
            return document.querySelector(elOrSelector);
        else if (elOrSelector instanceof Element)
            return elOrSelector;

        return null;
    }

    constructor(targetCnv, initCallback, frameCallback, options) {

        this.cnv = ParticleEnv.getEl(targetCnv);
        if (!this.cnv)
            throw 'target canvas must be an element or a selector.';

        if (typeof initCallback !== 'function')
            throw 'Init callback must be a function.';
        if (typeof frameCallback !== 'function')
            throw 'Frame callback must be a function.';

        this.initCallback = initCallback;
        this.frameCallback = frameCallback;

        this.options = options || {};

        this.parent = ParticleEnv.getEl(this.options.parent) || this.cnv.parentElement;

        this.ctx = this.cnv.getContext('2d');
        this.updateCanvasSize();

        let resizeCallback = ev => this.updateCanvasSize(ev);
        window.addEventListener('resize', resizeCallback);


        initCallback(this.cnv, this.ctx, this.cnvw, this.cnvh);

        this.frameNo = 0;
        this.prevFrameTimestamp = Date.now();
        this.reqNextFrame();
    }

    updateCanvasSize() {
        let prevW = this.cnvw;
        let prevH = this.cnvh;
        this.cnvw = cnv.width = this.parent.clientWidth;
        this.cnvh = cnv.height = this.parent.clientHeight;

        if (typeof this.options.resize === 'function' && (prevW !== this.cnvw || prevH !== this.cnvh))
            this.options.resize(this.cnvw, this.cnvh);
    }

    reqNextFrame() {
        this.frameID = window.requestAnimationFrame(() => {

            // calc new deltatime
            let timestamp = Date.now();
            this.deltaTime = timestamp - this.prevFrameTimestamp;
            this.deltaTimeS = this.deltaTime / 1000;

            this.frameCallback(this.cnv, this.ctx, this.deltaTime, this.deltaTimeS, this.frameNo, this.cnvw, this.cnvh);

            this.prevFrameTimestamp = timestamp;
            this.frameNo++;

            this.reqNextFrame();
        });
    }
}