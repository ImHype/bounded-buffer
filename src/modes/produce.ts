import { IProducer, IOptions, IResult } from "../interface";
import { BoundedBuffer } from "../bounded-buffer";

interface ProduceModeOptions<T> extends IOptions {
    producer: IProducer<T>;
    producerSize?: number;
}

export class ProduceInBackground<T> extends BoundedBuffer<T> {
    protected producer: IProducer<T>;

    protected sizePerRound: number;

    protected buffer: Array<IResult<T>> = [];

    constructor(options: ProduceModeOptions<T>) {
        super(options);

        this.producer = options.producer;

        this.sizePerRound = options.sizePerRound || options.bufferSize;

        let i = 0;
        while (i < (options.producerSize || 1)) {
            this.runInBackground();
            i++;
        }
    }

    protected async runInBackground() {
        while(true) {
            await this.produce(this.sizePerRound);
        }
    }

    protected async produce(max = 1) {
        const n = Math.max(1, Math.min(this.bufferSize, max));

        await this.empty.wait(n);
        
        let resourses = await this.producer.produce(n);

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

    async getItem() {
        await this.full.wait(1);
        const result = this.buffer.shift();
        this.empty.signal(1);

        if (result) {
            return result;
        }

        return {
            error: new Error('Unknow error!')
        }
    }
}