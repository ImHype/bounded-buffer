import { BoundedBuffer } from '../core/bounded-buffer';
import { IOptions, IConsumer } from '../core/interface';

interface ProducableOptions<T> extends IOptions {
    consumer: IConsumer<T>;
    consumerSize?: number;
    sizePerRound?: number;
}

export class Producable<T> extends BoundedBuffer<T> {
    protected consumer: IConsumer<T>;

    protected sizePerRound: number;

    constructor(options: ProducableOptions<T>) {
        super(options);

        this.consumer = options.consumer;

        this.sizePerRound = options.sizePerRound || options.bufferSize;

        const { consumerSize = 1 } = options;
        let i = 0;
        while (i < Math.min(consumerSize, 1)) {
            this.runInBackground();
            i++;
        }
    }

    protected async runInBackground() {
        while (true) {
            await this.consume(this.sizePerRound);
        }
    }

    protected async consume(max: number): Promise<void> {
        const n = Math.max(1, Math.min(max, this.buffer.length));

        await this.full.wait(n);

        const list = this.buffer.splice(0, n);

        try {
            const items: T[] = list.map(item => item.data as T);
            await this.consumer.consume(items);
        } catch (e) {
            this.logger.error(e);
        }

        this.empty.signal(n);
    }
}
