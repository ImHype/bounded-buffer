import * as util from 'util';

import { Callback } from './interface';

export class Semaphore {
    public block = util.promisify(this._block.bind(this));

    public value: number;
    private timer: NodeJS.Timeout | void;
    private list: Callback[] = [];

    constructor(value: number) {
        this.value = value;
        this.timer = void 0;
        this.openTimer();
    }

    public destroy() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }

    public wakeup() {
        const callback = this.list.shift();

        if (callback) {
            callback(null, void 0);
        }
    }

    public async wait(n = 1) {
        let i = 0;

        const promises: Array<Promise<void>> = [];

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

    private openTimer() {
        this.timer = setTimeout(() => this.openTimer(), 1000);
    }

    private _block(callback: Callback) {
        this.list.push(callback);
    }
}
