import { Producable, IProducer, IResult } from '../src';

class MyProducer implements IProducer<number> {
    public async produce(size: number) {
        const res: Array<IResult<number>> = [];
        for (let i = 0; i < size; i++) {
            res.push({
                data: i
            });
        }
        return res;
    }
}

const consumable = new Producable<number>({
    producer: new MyProducer(),
    bufferSize: 10,
    sizePerRound: 10
});

async function consume() {
    const res1 = await consumable.getItem();
    console.log('You could use:', res1);
}

consume()
    .catch(e => console.error(e))
    .then(() => consumable.destroy());
