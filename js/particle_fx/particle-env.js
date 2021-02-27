
// initializes a particle enviroment around a given canvas and with given functions
class ParticleEnv {

    static getEl(elOrSelector) {

        if (typeof elOrSelector === 'string')
            return document.querySelector(elOrSelector);
        else if (elOrSelector instanceof Element)
            return elOrSelector;

        return null;
    }

    constructor(targetCnv, options) {

        this.cnv = ParticleEnv.getEl(targetCnv);
        if (!this.cnv)
            throw 'target canvas must be an element or a selector.';

        this.options = options || {};
        this.parent = ParticleEnv.getEl(this.options.parent) || this.cnv.parentElement;

        this.ctx = this.cnv.getContext('2d');
        this.updateCanvasSize();

        let resizeCallback = ev => this.updateCanvasSize(ev);
        window.addEventListener('resize', resizeCallback);

        this.frameNo = 0;
        this.prevFrameTimestamp = Date.now();
    }

    updateCanvasSize() {
        let prevW = this.cnvw;
        let prevH = this.cnvh;
        this.cnvw = this.cnv.width = this.parent.clientWidth;
        this.cnvh = this.cnv.height = this.parent.clientHeight;

        if (typeof this.options.resize === 'function' && (prevW !== this.cnvw || prevH !== this.cnvh))
            this.resize();
    }

    _reqNextFrame() {
        this.frameID = window.requestAnimationFrame(() => {

            // calc new deltatime
            let timestamp = Date.now();
            let deltaTime = timestamp - this.prevFrameTimestamp;
            let deltaTimeS = deltaTime / 1000;

            this.frame(deltaTime, deltaTimeS, this.frameNo);

            this.prevFrameTimestamp = timestamp;
            this.frameNo++;

            this._reqNextFrame();
        });
    }

    start() {
        throw new Error(this.getNotImplementedExceptionText('start'));
    }

    frame(deltaTime, deltaTimeS, frameNo) {
        throw new Error(this.getNotImplementedExceptionText('frame'));
    }

    resize() { }

    getNotImplementedExceptionText(funName) {
        return `abstract function ${funName}() must be implemented in classes deriving from ParticleEnv.`
    }
}