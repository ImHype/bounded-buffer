import { IProducer, Consumable, IResult } from '../../src';

const utils = {
    sleep: (n: number) => new Promise(resolve => setTimeout(resolve, n))
};

describe('bounded-buffer#Consumable Mode, such as `make resources`', () => {
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
        consumable: Consumable<T>,
        n: any,
        isSynchronously = false
    ) => {
        let i = 0;
        const results: any[] = [];
        const promises: any[] = [];

        while (i < n) {
            const p = consumable
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
        const consumable = new Consumable<number>({
            producer,
            bufferSize: 10,
            sizePerRound: 10
        });

        try {
            await getItems(consumable, 10);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(consumable['buffer'].length).toBe(10);
        consumable.destroy();
    });

    it('#get 20 items', async () => {
        const consumable = new Consumable<number>({
            producer,
            bufferSize: 10,
            sizePerRound: 5,
            producerSize: 2
        });

        try {
            await getItems(consumable, 20);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(consumable['buffer'].length).toBe(10);
        consumable.destroy();
    });

    it('#get 100 items concurrency', async () => {
        const consumable = new Consumable<number>({
            producer,
            bufferSize: 10,
            sizePerRound: 5
        });

        try {
            await getItems(consumable, 100, true);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(consumable['buffer'].length).toBe(10);
        consumable.destroy();
    });

    it('#producer.produce occured error', async () => {
        const consumable = new Consumable<number>({
            producer: errorProducer,
            bufferSize: 10,
            sizePerRound: 5
        });

        let results: any[] = [];

        try {
            results = await getItems(consumable, 100, true);
        } catch (e) {
            console.error(e);
        }

        // tslint:disable-next-line
        expect(results.length).toBe(100);
        expect(results.filter(i => i.error).length).toBe(100);
        consumable.destroy();
    });
});
