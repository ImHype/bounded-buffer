import BoundedBuffer from '../src';

const utils = {
    sleep: (n: number) => new Promise(resolve => setTimeout(resolve, n))
};

describe('bounded-buffer# normal mode', () => {
    const consume = async (boundedBuffer: BoundedBuffer<number>, size: any) => {
        let i = 0;
        const results: any = [];

        while (i < size) {
            results.push(await boundedBuffer.getItem());
            i++;
        }

        return results;
    };

    const produce = async (boundedBuffer: BoundedBuffer<number>, size: any) => {
        let i = 0;
        const results: any = [];

        while (i < size) {
            results.push(await boundedBuffer.putItem(10));
            i++;
        }

        return results;
    };

    it('#produce and then consume', async () => {
        const boundedBuffer = new BoundedBuffer<number>({
            bufferSize: 10
        });

        let res: any[] = [];

        try {
            produce(boundedBuffer, 10);
            res = await consume(boundedBuffer, 10);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(res.length).toBe(10);
        boundedBuffer.destroy();
    });

    it('#consume and produce at the same time', async () => {
        const boundedBuffer = new BoundedBuffer<number>({
            bufferSize: 10
        });

        try {
            produce(boundedBuffer, 10);
            consume(boundedBuffer, 10);
        } catch (e) {
            console.error(e);
        }

        await utils.sleep(10);
        // tslint:disable-next-line
        expect(boundedBuffer['buffer'].length).toBe(0);
        boundedBuffer.destroy();
    });

    it('#one consumer and multiple producer', async () => {
        const boundedBuffer = new BoundedBuffer<number>({
            bufferSize: 10
        });

        let res: any[] = [];

        try {
            produce(boundedBuffer, 10);
            produce(boundedBuffer, 10);
            produce(boundedBuffer, 10);
            res = await consume(boundedBuffer, 30);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(res.length).toBe(30);
        boundedBuffer.destroy();
    });
});
