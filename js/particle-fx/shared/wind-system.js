
class WindSystem {

    static getDefaultSimulationParams() {
        // velocity is in px/s
        return {
            vxRange: new Range(1920 / 5, 1920 / 10),
            holdDurRange: new Range(0.5, 2),
            transitionDurRange: new Range(1, 4),
            printStateChanges: true
        };
    }

    constructor(params) {
        // run this before super because init() needs those properties
        this.params = params || WindSystem.getDefaultSimulationParams();
    }

    _rollWind() {

        this.prevVx = this.nextVx || this.params.vxRange.roll();

        this.nextVx = this.params.vxRange.roll();
        this.transitionDur = this.params.transitionDurRange.roll();
        this.holdDur = this.params.holdDurRange.roll();
        this.state = 't';

        this.currentVx = this.prevVx;

        this.remaining = this.transitionDur;
    }

    _logStateToConsole() {
        if (!this.params.printStateChanges) return;

        // quick helper function for printing
        let toFixedFloat = (f, n) => parseFloat(f.toFixed(n));

        if (this.state === 'h')
            console.log('[WIND] hold', toFixedFloat(this.currentVx, 2), this.holdDur.toFixed(2) + 's');
        else if (this.state === 't')
            console.log('[WIND] trns', toFixedFloat(this.prevVx, 2), ' => ', toFixedFloat(this.nextVx, 2), this.transitionDur.toFixed(2) + 's');
    }

    start() {
        this._rollWind();
        this._logStateToConsole();
    }

    frame(deltaTime, deltaTimeS, frameNo) {

        // decrease remaining by deltaTime in seconds
        this.remaining -= deltaTimeS;

        // check if the current wind phase should end
        if (this.remaining <= 0) {

            if (this.state == 't') {

                // transition phase ended, start hold phase
                this.state = 'h';
                this.prevVx = this.currentVx = this.nextVx;
                this.remaining = this.holdDur;

                // print information about the new wind phase
                this._logStateToConsole();

            } else {
                // hold phase ended, start transiton phase
                this._rollWind();
                this._logStateToConsole();
            }
        } else if (this.state == 't') {

            // windPrevVx    -> windNextVx
            // windRemaining -> 0
            // invert windRemaining so it goes from 0 -> windTransitionDur
            let windVxRange = new Range(this.prevVx, this.nextVx);
            let windDurRange = new Range(this.transitionDur, 0);

            this.currentVx = windVxRange.lerp(windDurRange.getFraction(this.remaining));
            //this.currentVx = (this.nextVx - this.prevVx) * (this.transitionDur - this.remaining) / this.transitionDur + this.prevVx;
        }
    }
}
