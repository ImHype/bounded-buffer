import { IProducer, Producable, IResult } from '../../src';

const utils = {
    sleep: (n: number) => new Promise(resolve => setTimeout(resolve, n))
};

describe('bounded-buffer#Producable Mode, such as `make resources`', () => {
    const producer = new class implements IProducer<number> {
        public async produce(size = 1) {
            const res: Array<IResult<number>> = [];
            for (let i = 0; i < size; i++) {
                res.push({
                    data: i
                });
            }
            return res;
        }
    }();

    // tslint:disable-next-line
    const errorProducer = new class implements IProducer<number> {
        public async produce(size = 1) {
            const res: Array<IResult<number>> = [];
            throw new Error('unknown');
            return res;
        }
    }();

    const getItems = async <T>(
        Producable: Producable<T>,
        n: any,
        isSynchronously = false
    ) => {
        let i = 0;
        const results: any[] = [];
        const promises: any[] = [];

        while (i < n) {
            const p = Producable
                .getItem()
                .then(data => ({ data }))
                .catch(e => ({ error: e }));

            if (isSynchronously) {
                promises.push(p);
            } else {
                let res;
                res = await p;
                results.push(res);
            }

            i++;
            await utils.sleep(10);
        }

        if (promises.length > 0) {
            return Promise.all(promises);
        }

        return results;
    };

    it('#get 10 items', async () => {
        const producable = new Producable<number>({
            producer,
            bufferSize: 10,
            sizePerRound: 10
        });

        try {
            await getItems(producable, 10);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(producable['buffer'].length).toBe(10);
        producable.destroy();
    });

    it('#get 20 items', async () => {
        const producable = new Producable<number>({
            producer,
            bufferSize: 10,
            sizePerRound: 5,
            producerSize: 2
        });

        try {
            await getItems(producable, 20);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(producable['buffer'].length).toBe(10);
        producable.destroy();
    });

    it('#get 100 items concurrency', async () => {
        const producable = new Producable<number>({
            producer,
            bufferSize: 10,
            sizePerRound: 5
        });

        try {
            await getItems(producable, 100, true);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(producable['buffer'].length).toBe(10);
        producable.destroy();
    });

    it('#producer.produce occured error', async () => {
        const producable = new Producable<number>({
            producer: errorProducer,
            bufferSize: 10,
            sizePerRound: 5
        });

        let results: any[] = [];

        try {
            results = await getItems(producable, 100, true);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(results.length).toBe(100);
        expect(results.filter(i => i.error).length).toBe(100);
        producable.destroy();
    });
});
