import { BoundedBuffer } from "../bounded-buffer";
import { IOptions, IConsumer } from "../interface";

interface ConsumeModeOptions<T> extends IOptions {
    consumer: IConsumer<T>;
    consumerSize?: number;
}

export class ConsumeInBackground<T> extends BoundedBuffer<T> {
    protected consumer: IConsumer<T>;

    protected sizePerRound: number;

    protected buffer: Array<T> = [];

    constructor(options: ConsumeModeOptions<T>) {
        super(options);

        this.consumer = options.consumer;

        this.sizePerRound = options.sizePerRound || options.bufferSize;

        let i = 0;
        while (i < (options.consumerSize || 1)) {
            this.runInBackground();
            i++;
        }
    }

    protected async runInBackground() {
        while(true) {
            await this.consume(this.sizePerRound);
        }
    }

    async putItem(data: T) {
        await this.empty.wait(1);
        this.buffer = [
            ...this.buffer, data
        ];
        this.full.signal(1);
    }

    protected async consume(
        max: number
    ): Promise<void>{
        const n = Math.max(1, Math.min(max, this.buffer.length));

        await this.full.wait(n);

        const list = this.buffer.splice(0, n);

        await this.consumer.consume(list as T[]);

        this.empty.signal(n);
    }
}