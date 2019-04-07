import * as util from 'util';

import { Callback } from "./interface";

export class Semaphore {
    public value: number;
    private timer: NodeJS.Timeout | void;
    private list: Array<Callback> = [];

    constructor(value: number) {
        this.value = value;
        this.timer = void 0;
        this.openTimer();
    }

    private openTimer() {
        this.timer = setTimeout(() => this.openTimer(), 1000);
    }

    public destroy() {
        if (this.timer)
            clearTimeout(this.timer);
    }

    public block = util.promisify(this._block.bind(this));

    public async wait(n = 1) {
        let i = 0;
        let promises = [];

        while (i < n) {
            this.value = this.value - 1;

            if (this.value < 0) {
                promises.push(this.block());
            }
            i++;
        }

        await Promise.all(promises);
    }

    public signal(n = 1) {
        let i = 0;

        while (i < n) {
            this.value += 1;
            this.wakeup();
            i++;
        }
    }

    private _block(callback: Callback) {
        this.list.push(callback);
    }

    public wakeup() {
        const callback = this.list.shift();

        if (callback) {
            callback(null);
        }
    }
}