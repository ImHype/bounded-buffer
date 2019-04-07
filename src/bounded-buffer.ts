import { Semaphore } from "./semaphore";

export interface IProducer<T> {
    produce: {(size?: number): Promise<Array<Result<T>> | Result<T>>}
}

interface Options<T> {
    size: number;
    producer: IProducer<T>;
}

interface Result<T> {
    error?: Error, data?: T
}


export class BoundedBuffer<T> {
    private options: Options<T>;

    private buffer: Array<Result<T>> = [];

    private full: Semaphore = new Semaphore(0);

    private empty: Semaphore;

    constructor(options: Options<T>) {
        this.options = options;
        this.empty = new Semaphore(this.size);
    }

    get size() {
        return this.options.size;
    }

    get producer() {
        return this.options.producer;
    };

    async produce(n = 1) {
        n = Math.max(1, Math.min(this.size, n));

        await this.empty.wait(n);

        let resourses = await this.producer.produce(n);

        if (!Array.isArray(resourses)) {
            resourses = [resourses];
        }

        const results = [];

        for (let i = 0; i < n; i++) {
            results[i] = resourses[i];
        }

        this.buffer = [
            ...this.buffer,
            ...results
        ];

        this.full.signal(n);
    }

    async get() {
        await this.full.wait();

        const result = this.buffer.shift();

        this.empty.signal();

        if (result !== void 0) {
            if (result.error) {
                throw result.error;
            } else {
                return result.data;
            }
        }
    }
}