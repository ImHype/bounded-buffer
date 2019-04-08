import { Semaphore } from './semaphore';
import { IOptions, Logger, IResult } from './interface';

export class BoundedBuffer<T> {
    protected options: IOptions;

    protected full: Semaphore = new Semaphore(0);

    protected empty: Semaphore;

    protected logger: Logger;

    protected buffer: Array<IResult<T>> = [];

    constructor(options: IOptions) {
        this.options = options;
        this.empty = new Semaphore(this.bufferSize);

        this.logger = options.logger || console;
    }

    get bufferSize() {
        return this.options.bufferSize;
    }

    public async getItem(): Promise<T> {
        await this.full.wait(1);

        const result = this.buffer.shift();

        this.empty.signal(1);

        if (result === void 0) {
            throw new Error(
                'An exception occurred during `BoundedBuffer.getItem`: The buffer has been empty.'
            );
        }

        if ('error' in result) {
            throw result.error;
        }

        return result.data as T;
    }

    public async putItem(data: T) {
        await this.empty.wait(1);

        this.buffer = [...this.buffer, { data }];

        this.full.signal(1);
    }

    public destroy() {
        this.empty.destroy();
        this.full.destroy();
    }
}
