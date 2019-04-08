import { IProducer, IOptions, IResult } from '../core/interface';
import { BoundedBuffer } from '../core/bounded-buffer';
import { newArray } from '../core/utils';

interface ReaderOptions<T> extends IOptions {
    producer: IProducer<T>;
    producerSize?: number;
    sizePerRound?: number;
}

export class Consumable<T> extends BoundedBuffer<T> {
    protected producer: IProducer<T>;

    protected sizePerRound: number;

    constructor(options: ReaderOptions<T>) {
        super(options);

        this.producer = options.producer;

        this.sizePerRound = options.sizePerRound || options.bufferSize;

        const { producerSize = 1 } = options;
        let i = 0;
        while (i < Math.min(producerSize, 1)) {
            this.runInBackground();
            i++;
        }
    }

    protected async runInBackground() {
        while (true) {
            await this.produce(this.sizePerRound);
        }
    }

    protected async produce(max = 1) {
        let resourses: Array<IResult<T>> = [];
        let error: Error;

        const n = Math.max(1, Math.min(this.bufferSize, max));

        await this.empty.wait(n);

        try {
            resourses = await this.producer.produce(n);
        } catch (e) {
            error = e;
        }

        const results: Array<IResult<T>> = newArray(n, i => {
            if (i in resourses) {
                return resourses[i];
            }

            const e: Error =
                error ||
                new Error(
                    'An exception occurred during `Producer.produce`: There is nothing could be resolved'
                );

            return {
                error: e
            };
        });

        this.buffer = [...this.buffer, ...results];

        this.full.signal(n);
    }
}
